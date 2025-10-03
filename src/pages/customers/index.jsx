import { Box, debounce, ThemeProvider } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { CustomerModal } from '../../components/CustomersModal';
import { DataTable } from '../../components/DataTable';
import { ITEMS_PER_PAGE } from '../../constants';
import {
  useAddCustomer,
  useDeleteCustomer,
  useGetCustomers,
  useUpdateCustomer,
} from '../../services/customer/useCustomer';
import theme from '../../theme';

const columns = [
  {
    field: 'firstName',
    header: 'First Name',
    sortable: true,
  },
  {
    field: 'lastName',
    header: 'Last Name',
    sortable: true,
  },
  {
    field: 'email',
    header: 'Email',
    sortable: true,
  },
  {
    field: 'roleName',
    header: 'Role',
    sortable: true,
    type: 'chip',
    chipColor: (value) => {
      if (value === 'super admin') return 'error';
      else if (value === 'admin') return 'primary';
      else if (value === 'customer') return 'success';
      return 'default';
    },
  },
];

export const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const offset = (page - 1) * ITEMS_PER_PAGE;

  const params = new URLSearchParams({
    _offset: offset,
    _limit: ITEMS_PER_PAGE,
    _sort: 'firstName',
    _order: 'asc',
    _search: searchTerm,
  });

  const { data: customers = [], error } = useGetCustomers(params.toString());
  const addCustomerMutation = useAddCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  const customerRecords = useMemo(() => {
    if (customers) {
      return customers?.records?.map((customer) => ({
        id: customer.userId,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        roleName: customer.userTenantRelation[0].role.name.replaceAll('-', ' '),
      }));
    }
  }, [customers]);

  const performSearch = (query) => {
    setSearchTerm(query);
  };

  const debouncedSearch = useCallback(
    debounce((query) => performSearch(query), 500),
    []
  );

  const handleChange = (event) => {
    const newValue = event.target.value;
    debouncedSearch(newValue);
  };
  const handlePageChange = (_, newPage) => {
    setPage(newPage);
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsAddModalOpen(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setIsAddModalOpen(true);
  };

  const handleDeleteCustomer = (customer) => {
    deleteCustomerMutation.mutate(customer.id, {
      onSuccess: () => {
        toast.success('Customer deleted successfully');
      },
      onError: (error) => {
        toast.error('Failed to delete customer');
        console.error('Delete error:', error);
      },
    });
  };

  const handleSubmitCustomer = (formData) => {
    const customerPayload = {
      ...formData,
      tenantId: 1,
    };

    if (editingCustomer) {
      delete customerPayload.email;
      updateCustomerMutation.mutate(
        { id: editingCustomer.id, data: formData },
        {
          onSuccess: () => {
            toast.success('Customer updated successfully');
            setIsAddModalOpen(false);
          },
          onError: (error) => {
            toast.error('Failed to update customer');
            console.error('Update error:', error);
          },
        }
      );
    } else {
      addCustomerMutation.mutate(customerPayload, {
        onSuccess: () => {
          toast.success('Customer added successfully');
          setIsAddModalOpen(false);
        },
        onError: (error) => {
          toast.error('Failed to add customer');
          console.error('Add error:', error);
        },
      });
    }
  };

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            p: 3,
            backgroundColor: 'background.default',
          }}
        >
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <h2>Error loading customers</h2>
            <p>Please try again later.</p>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3, backgroundColor: 'background.default' }}>
        <DataTable
          title='Customers'
          data={customerRecords}
          columns={columns}
          onAdd={handleAddCustomer}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteCustomer}
          pageCount={Math.ceil((customers?.totalCount || 0) / ITEMS_PER_PAGE)}
          page={page}
          handlePageChange={handlePageChange}
          handlesSearch={handleChange}
        />

        <CustomerModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleSubmitCustomer}
          initialData={editingCustomer}
          title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
        />
      </Box>
    </ThemeProvider>
  );
};
