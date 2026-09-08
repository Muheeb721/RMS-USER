import { FALLBACK_IMAGE } from './imageUtils';

const LOCAL_IMAGE_ROOT = '/images';

export const PROPERTY_IMAGE_MAP = {
  '2 storey house': `${LOCAL_IMAGE_ROOT}/houses/house-2-storey.svg`,
  '3 storey house': `${LOCAL_IMAGE_ROOT}/houses/house-3-storey.svg`,
  '4 storey house': `${LOCAL_IMAGE_ROOT}/houses/house-4-storey.svg`,
  '5 storey house': `${LOCAL_IMAGE_ROOT}/houses/house-5-storey.svg`,
  '6 storey house': `${LOCAL_IMAGE_ROOT}/houses/house-6-storey.svg`,
  '7 storey house': `${LOCAL_IMAGE_ROOT}/houses/house-7-storey.svg`,
  'a block apartment': `${LOCAL_IMAGE_ROOT}/apartments/a-block.svg`,
  'b block apartment': `${LOCAL_IMAGE_ROOT}/apartments/b-block.svg`,
  'c block apartment': `${LOCAL_IMAGE_ROOT}/apartments/c-block.svg`,
  'park view flat 1': `${LOCAL_IMAGE_ROOT}/flats/flat-park-1.svg`,
  'park view flat 2': `${LOCAL_IMAGE_ROOT}/flats/flat-park-2.svg`,
  'park view flat 3': `${LOCAL_IMAGE_ROOT}/flats/flat-park-3.svg`,
  'flat 1': `${LOCAL_IMAGE_ROOT}/flats/flat-park-1.svg`,
  'flat 2': `${LOCAL_IMAGE_ROOT}/flats/flat-park-2.svg`,
  'flat 3': `${LOCAL_IMAGE_ROOT}/flats/flat-park-3.svg`,
};

const imageFromTitle = (property = {}) => {
  const title = String(property?.title || property?.name || property?.type || '').trim().toLowerCase();
  const type = String(property?.type || property?.propertyType || property?.category || '').trim().toLowerCase();
  const composite = `${title} ${type}`.trim();

  const matches = Object.entries(PROPERTY_IMAGE_MAP).find(([key]) => {
    if (!key) return false;
    return composite.includes(key) || title.includes(key) || type.includes(key);
  });

  return matches ? matches[1] : null;
};

export const getPropertyImage = (property = {}) => {
  if (Array.isArray(property?.images) && property.images.length) {
    return property.images[0];
  }

  if (property?.image) {
    return property.image;
  }

  const match = imageFromTitle(property);
  if (match) return match;

  const textType = String(property?.type || property?.propertyType || property?.category || '').toLowerCase();
  if (textType.includes('house')) return `${LOCAL_IMAGE_ROOT}/houses/house-5-storey.svg`;
  if (textType.includes('apartment')) return `${LOCAL_IMAGE_ROOT}/apartments/b-block.svg`;
  if (textType.includes('flat')) return `${LOCAL_IMAGE_ROOT}/flats/flat-park-2.svg`;
  return FALLBACK_IMAGE;
};

export const getPropertyGallery = (property = []) => {
  const explicit = Array.isArray(property?.images) && property.images.length ? property.images : [];
  const primary = getPropertyImage(property);
  if (explicit.length) return explicit;
  return [primary];
};

export default { PROPERTY_IMAGE_MAP, getPropertyImage, getPropertyGallery };
