import { cache } from 'react';
import { readPublishedPromiseLedger } from '../heart-data';
import { adaptAtlas } from './adapter';

/** React request cache: verdict and map share the same immutable run per render. */
export const getPublishedLedger = cache(readPublishedPromiseLedger);
export const getPublishedAtlas = cache(async () => adaptAtlas(await getPublishedLedger()));
