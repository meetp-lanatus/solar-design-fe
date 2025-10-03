import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addCustomer, deleteCustomer, getCustomers, updateCustomer } from './customer.api';

export const useGetCustomers = (params) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: async () => {
      const res = await getCustomers(params);
      return res.data;
    },
  });
};

export const useAddCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await addCustomer(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await updateCustomer(id, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await deleteCustomer(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};
