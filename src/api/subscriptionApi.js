import axiosInstance from './axiosInstance';

export const getPlansApi = () =>
  axiosInstance.get('/subscriptions/plans');

export const getCurrentSubscriptionApi = () =>
  axiosInstance.get('/subscriptions/current');

export const createOrderApi = (planId) =>
  axiosInstance.post('/subscriptions/create-order', { planId });

export const verifyPaymentApi = (paymentData) =>
  axiosInstance.post('/subscriptions/verify-payment', paymentData);

export const getBillingHistoryApi = () =>
  axiosInstance.get('/subscriptions/billing');