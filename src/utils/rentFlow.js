import { toast } from 'react-toastify';
import { savePendingAction } from './authRedirect';
import { saveSelectedProperty } from './selectedPropertyStorage.jsx';

const isValidPropertyId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id || ''));

export const getRentUnavailableStatus = (property) => {
  const status = String(property?.status || property?.availability || '').trim().toLowerCase();
  if (['booked', 'reserved', 'occupied'].includes(status)) return 'Booked';
  if (['rented', 'leased', 'tenant occupied'].includes(status)) return 'Rented';
  if (['sold', 'closed'].includes(status)) return 'Sold';
  if (['unavailable', 'not available'].includes(status)) return 'Unavailable';
  return '';
};

export const startRentNow = async (property, isAuthenticated, navigate) => {
  const propertyId = property?.id || property?._id;
  if (!property || !isValidPropertyId(propertyId)) {
    toast.error('This property cannot be booked because its listing ID is missing or invalid.');
    return false;
  }

  const savedProperty = await saveSelectedProperty(property);
  if (!savedProperty) {
    toast.error('Unable to preserve the selected property. Please try again.');
    return false;
  }

  const rentRoute = `/rental-application?propertyId=${encodeURIComponent(propertyId)}`;
  if (isAuthenticated) {
    navigate(rentRoute);
    return true;
  }

  savePendingAction({
    action: 'RENT_NOW',
    propertyId,
    propertyType: property?.type || property?.propertyType || '',
    propertyTitle: property?.title || property?.name || '',
    returnRoute: rentRoute,
  });
  navigate(`/signup?redirect=${encodeURIComponent(rentRoute)}`);
  return true;
};
