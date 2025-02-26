// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Box, Typography} from '@mui/material';
import DOMPurify from 'dompurify';
import {type JSX, useEffect, useState} from 'react';

type PropsType = {url: string; title?: string};
const StaticPageView = ({url, title}: PropsType): JSX.Element => {
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
      >
        {title !== undefined && (
          <Typography variant="h4" sx={{marginBottom: '16px'}}>
            {title}
          </Typography>
        )}
        <span
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(htmlContent)}}
        />
      </Box>
    </Box>
  );
};

export default StaticPageView;
