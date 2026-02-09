/**
 * Enhanced database layer for new features
 * Provides functions for managing favorites, comparisons, and search history
 */
import fs from 'fs/promises';
import path from 'path';
import type { 
  EnhancedPlot, 
  EnhancedInquiry, 
  Favorite, 
  Comparison, 
  SearchHistory 
} from './enhanced-definitions';

// Data file paths
const favoritesDataPath = path.join(process.cwd(), 'src', 'lib', 'favorites-data.json');
const comparisonsDataPath = path.join(process.cwd(), 'src', 'lib', 'comparisons-data.json');
const searchHistoryDataPath = path.join(process.cwd(), 'src', 'lib', 'search-history-data.json');

/**
 * Read favorites data from file
 * @returns Promise resolving to array of favorites
 */
export async function readFavorites(): Promise<Favorite[]> {
  try {
    const fileContent = await fs.readFile(favoritesDataPath, 'utf-8');
    return JSON.parse(fileContent) as Favorite[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error('Failed to read favorites data:', error);
    return [];
  }
}

/**
 * Write favorites data to file
 * @param favorites - Array of favorites to save
 * @returns Promise that resolves when write is complete
 */
export async function writeFavorites(favorites: Favorite[]): Promise<void> {
  try {
    await fs.writeFile(favoritesDataPath, JSON.stringify(favorites, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write favorites data:', error);
  }
}

/**
 * Read comparisons data from file
 * @returns Promise resolving to array of comparisons
 */
export async function readComparisons(): Promise<Comparison[]> {
  try {
    const fileContent = await fs.readFile(comparisonsDataPath, 'utf-8');
    return JSON.parse(fileContent) as Comparison[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error('Failed to read comparisons data:', error);
    return [];
  }
}

/**
 * Write comparisons data to file
 * @param comparisons - Array of comparisons to save
 * @returns Promise that resolves when write is complete
 */
export async function writeComparisons(comparisons: Comparison[]): Promise<void> {
  try {
    await fs.writeFile(comparisonsDataPath, JSON.stringify(comparisons, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write comparisons data:', error);
  }
}

/**
 * Read search history data from file
 * @returns Promise resolving to array of search history entries
 */
export async function readSearchHistory(): Promise<SearchHistory[]> {
  try {
    const fileContent = await fs.readFile(searchHistoryDataPath, 'utf-8');
    return JSON.parse(fileContent) as SearchHistory[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error('Failed to read search history data:', error);
    return [];
  }
}

/**
 * Write search history data to file
 * @param history - Array of search history entries to save
 * @returns Promise that resolves when write is complete
 */
export async function writeSearchHistory(history: SearchHistory[]): Promise<void> {
  try {
    await fs.writeFile(searchHistoryDataPath, JSON.stringify(history, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write search history data:', error);
  }
}
