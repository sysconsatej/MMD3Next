'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';

export default function PdfPreview({ file }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!file) { setUrl(''); return; }
    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  if (!file) return <Typography color="text.secondary">Select a file to preview.</Typography>;

  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
        <Typography variant="subtitle1" fontWeight={700} noWrap title={file.name}>{file.name}</Typography>
        <Button href={url || undefined} target="_blank" rel="noopener noreferrer" disabled={!url} size="small">Open PDF</Button>
      </Box>
      {url && <Box component="iframe" title={`PDF preview: ${file.name}`} src={url} sx={{ width: '100%', height: { xs: 440, md: 660 }, border: '1px solid', borderColor: 'divider', borderRadius: 1 }} />}
    </Paper>
  );
}
