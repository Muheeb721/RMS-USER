export const isSaleProperty = (property = {}) => {
  const transaction = String(
    property.listingType || property.listing_type || property.transactionType || property.purpose || '',
  ).trim().toLowerCase();
  if (transaction) {
    return ['sale', 'sell', 'buy', 'purchase', 'for sale'].includes(transaction);
  }

  const type = String(property.type || property.propertyType || property.category || '').trim().toLowerCase();
  return ['house', 'apartment', 'sale', 'buy', 'purchase'].includes(type);
};

export const getPropertyId = (property = {}) => property.id || property._id || '';

export const getSaleInterestRoute = (property = {}) => {
  const id = encodeURIComponent(getPropertyId(property));
  return `/sale-interest?propertyId=${id}`;
};

export default { isSaleProperty, getPropertyId, getSaleInterestRoute };
