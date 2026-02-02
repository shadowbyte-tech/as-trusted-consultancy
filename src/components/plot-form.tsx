
'use client';

import { useActionState, useEffect, useState } from 'react';
import { createPlot, updatePlot } from '@/lib/actions';
import type { Plot, PlotFacing, State } from '@/lib/definitions';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle, FileUp, Save, Loader2, Image as ImageIcon, ArrowLeft, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Textarea } from './ui/textarea';
import { generatePlotDescription } from '@/ai/flows/generate-plot-description-flow';
import { useRouter } from 'next/navigation';

const plotFacings: PlotFacing[] = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Saving...' : 'Uploading...'}
                </>
            ) : (
                <>
                    {isEditing ? <Save className="mr-2 h-4 w-4" /> : <FileUp className="mr-2 h-4 w-4" />}
                    {isEditing ? 'Save Changes' : 'Upload Plot'}
                </>
            )}
        </Button>
    )
}

export default function PlotForm({ plot }: { plot?: Plot }) {
  const { toast } = useToast();
  const router = useRouter();
  const [description, setDescription] = useState(plot?.description || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const isApiKeyConfigured = process.env.NEXT_PUBLIC_GEMINI_API_KEY_CONFIGURED === 'true';

  const initialState: State = { message: null, errors: {}, success: false, plotId: null };
  const action = plot ? updatePlot.bind(null, plot.id) : createPlot;
  const [state, dispatch] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      const successMessage = state.message || (plot ? 'Plot updated successfully!' : 'Plot created successfully!');
      toast({
        title: 'Success!',
        description: successMessage,
      });
      router.push('/dashboard');
    } else if (state.message) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, router, plot]);

  const handleGenerateDescription = async (form: HTMLFormElement) => {
    setIsGenerating(true);

    const formData = new FormData(form);
    const plotSize = formData.get('plotSize') as string;
    const plotFacing = formData.get('plotFacing') as string;
    const areaName = formData.get('areaName') as string;
    const villageName = formData.get('villageName') as string;

    if (!plotSize || !plotFacing || !areaName || !villageName) {
        toast({
            variant: 'destructive',
            title: 'Missing Details',
            description: 'Please fill in plot size, facing, area, and village name to generate a description.',
        });
        setIsGenerating(false);
        return;
    }

    try {
        const result = await generatePlotDescription({
            plotSize,
            plotFacing,
            areaName,
            villageName,
        });
        setDescription(result.description);
        toast({
            title: 'Description Generated',
            description: 'The AI-powered description has been added below.',
        })
    } catch(e) {
        console.error(e);
        let errorMessage = 'Could not generate description. The AI model may have encountered an error.';
        if (e instanceof Error && (e.message.includes('503') || e.message.includes('overloaded'))) {
             errorMessage = 'Could not generate description because the AI model is busy. Please try again in a moment.';
        }
        toast({
            variant: 'destructive',
            title: 'Generation Failed',
            description: errorMessage,
        });
    } finally {
        setIsGenerating(false);
    }
  }

  return (
    <form action={dispatch}>
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="plotNumber">Plot Number</Label>
              <Input id="plotNumber" name="plotNumber" placeholder="e.g., A-101" defaultValue={plot?.plotNumber} required />
              {state.errors?.plotNumber && <p className="text-sm text-destructive">{state.errors.plotNumber[0]}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="plotSize">Plot Size</Label>
              <Input id="plotSize" name="plotSize" placeholder="e.g., 2400 sqft" defaultValue={plot?.plotSize} required />
              {state.errors?.plotSize && <p className="text-sm text-destructive">{state.errors.plotSize[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="villageName">Village Name</Label>
              <Input id="villageName" name="villageName" placeholder="e.g., Greenwood" defaultValue={plot?.villageName} required />
              {state.errors?.villageName && <p className="text-sm text-destructive">{state.errors.villageName[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="areaName">Area Name</Label>
              <Input id="areaName" name="areaName" placeholder="e.g., Sunrise Valley" defaultValue={plot?.areaName} required />
              {state.errors?.areaName && <p className="text-sm text-destructive">{state.errors.areaName[0]}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="plotFacing">Plot Facing</Label>
            <Select name="plotFacing" defaultValue={plot?.plotFacing} required>
              <SelectTrigger id="plotFacing">
                <SelectValue placeholder="Select a direction" />
              </SelectTrigger>
              <SelectContent>
                {plotFacings.map((facing) => (
                  <SelectItem key={facing} value={facing}>{facing}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.plotFacing && <p className="text-sm text-destructive">{state.errors.plotFacing[0]}</p>}
          </div>

          <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="A compelling description of the plot..." 
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                disabled={isGenerating || !isApiKeyConfigured}
                onClick={(e) => handleGenerateDescription(e.currentTarget.form!)}
              >
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Generate with AI
              </Button>
               {!isApiKeyConfigured && <p className="text-xs text-muted-foreground mt-1">AI generation is disabled. Configure a Gemini API key to enable it.</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">
                <div className='flex items-center gap-2'>
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    Plot Image
                </div>
            </Label>
            <Input id="imageUrl" name="imageUrl" type="file" accept="image/png, image/jpeg" required={!plot} />
             {plot && <p className="text-sm text-muted-foreground">Leave blank to keep the existing image.</p>}
            {state.errors?.imageUrl && <p className="text-sm text-destructive">{state.errors.imageUrl[0]}</p>}
          </div>
          
          {state.message && !state.success && (
             <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button asChild variant="outline">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Link>
            </Button>
            <SubmitButton isEditing={!!plot} />
        </CardFooter>
      </Card>
    </form>
  );
}
