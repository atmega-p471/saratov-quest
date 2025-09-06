import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const PlacePage: React.FC = () => {
  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Страница места
        </Typography>
        <Typography variant="body1">
          Здесь будет подробная информация о выбранном месте.
        </Typography>
      </Box>
    </Container>
  );
};

export default PlacePage;
