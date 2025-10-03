import { MoreVert as MoreVertIcon, Search as SearchIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

export const DataTable = ({
  title,
  data = [],
  columns = [],
  onAdd,
  onEdit,
  onDelete,
  pageCount,
  page,
  handlePageChange,
  handlesSearch,
  searchPlaceholder = 'Search...',
  searchTerm,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleEdit = () => {
    if (onEdit && selectedRow) {
      onEdit(selectedRow);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (onDelete && selectedRow) {
      onDelete(selectedRow);
    }
    handleMenuClose();
  };

  const renderCellContent = (row, column) => {
    const value = row[column.field];
    if (column.render) {
      return column.render(value, row);
    }

    if (column.type === 'chip') {
      return <Chip label={value} color={column.chipColor(value)} size='small' variant='filled' />;
    }

    return value;
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant='h1' sx={{ fontSize: '2rem', fontWeight: 700 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {!!handlesSearch && (
            <TextField
              type='search'
              size='small'
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handlesSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
          )}
          {onAdd && (
            <Button variant='contained' color='primary' startIcon={<span>+</span>} onClick={onAdd}>
              Add {title}
            </Button>
          )}
        </Box>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.100' }}>
                {columns.map((column) => (
                  <TableCell
                    key={column.field}
                    sx={{
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      color: 'text.secondary',
                    }}
                  >
                    {column.header}
                  </TableCell>
                ))}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((row, index) => (
                <TableRow key={row.id || index} hover>
                  {columns.map((column) => (
                    <TableCell key={column.field}>{renderCellContent(row, column)}</TableCell>
                  ))}
                  <TableCell>
                    <IconButton size='small' onClick={(e) => handleMenuClick(e, row)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            p: 2,
          }}
        >
          <Pagination
            count={pageCount}
            page={page}
            onChange={handlePageChange}
            color='primary'
            showFirstButton
            showLastButton
          />
        </Box>
      </Paper>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {onEdit && <MenuItem onClick={handleEdit}>Edit</MenuItem>}
        {onDelete && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            Delete
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};
