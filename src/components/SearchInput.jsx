import { Search as SearchIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';

export default function SearchInput({
  searchQuery,
  onSearchInput,
  onSearchSubmit,
  isSearching,
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography
        variant="body2"
        sx={{ fontWeight: 500, color: 'text.primary' }}
      >
        Search by place name or address
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          type="search"
          fullWidth
          value={searchQuery}
          onChange={onSearchInput}
          placeholder="Search for places..."
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={onSearchSubmit}
          size="small"
          sx={{ minWidth: 'auto', px: 2 }}
          startIcon={<SearchIcon />}
          disabled={isSearching}
        >
          Search
        </Button>
      </Box>
    </Box>
  );
}
