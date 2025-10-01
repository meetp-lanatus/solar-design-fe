import { Box, CircularProgress, List, ListItem, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';

export default function SearchResults({
    showSuggestions,
    isSearching,
    searchResults,
    searchQuery,
    onResultSelect
}) {
    const highlightMatch = (text, query) => {
        if (!text || !query) return text;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(
            regex,
            '<mark class="bg-yellow-200 text-slate-900 px-1 rounded-sm font-medium">$1</mark>'
        );
    };

    if (!showSuggestions) return null;

    return (
        <Paper
            elevation={2}
            sx={{
                maxHeight: 224,
                overflow: 'auto',
                border: 1,
                borderColor: 'grey.200',
            }}
        >
            {isSearching ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                        Loading…
                    </Typography>
                </Box>
            ) : searchResults.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        No results found
                    </Typography>
                </Box>
            ) : (
                <List dense>
                    {searchResults.map((result, index) => {
                        const location = result.geometry?.location;
                        if (!location?.lat || !location?.lng) return null;

                        return (
                            <ListItem key={index} disablePadding>
                                <ListItemButton
                                    onClick={() => onResultSelect(result)}
                                    sx={{
                                        '&.Mui-selected': {
                                            backgroundColor: 'primary.light',
                                            '&:hover': {
                                                backgroundColor: 'primary.main',
                                            },
                                        },
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="body2"
                                                sx={{ fontWeight: 500 }}
                                                dangerouslySetInnerHTML={{
                                                    __html: highlightMatch(result.formatted_address, searchQuery),
                                                }}
                                            />
                                        }
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            )}
        </Paper>
    );
}
