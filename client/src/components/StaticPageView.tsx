// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Box, Typography} from '@mui/material';
import DOMPurify from 'dompurify';
import React, {useEffect, useState} from 'react';

interface StaticPageProps {
  url: string;
  title?: string;
}

const StaticPageView: React.FC<StaticPageProps> = ({url, title}) => {
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    const fetchHtmlContent = async (): Promise<void> => {
      try {
        const response = await fetch(url);
        const html = await response.text();
        setHtmlContent(html);
      } catch (error) {
        console.error('Error fetching HTML content:', error);
      }
    };

    fetchHtmlContent();
  }, [url]);

  return (
    <Box sx={{height: '100%', display: 'flex', gap: '16px'}}>
      <Box
        sx={{
          width: '100%',
          overflowY: 'auto',
          backgroundColor: 'var(--mui-palette-background-paper)',
          borderRadius: '15px',
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingTop: '8px',
          viewTransitionName: 'content',
          textAlign: 'start',
        }}
        className="static-page-container"
      >
        {title && (
          <Typography variant="h4" sx={{marginBottom: '16px'}}>
            {title}
          </Typography>
        )}
        <span
          dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(htmlContent)}}
        />
      </Box>
    </Box>
  );
};

export default StaticPageView;
