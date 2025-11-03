import React from 'react';
// Material-UI components (aapke project ke hisab se icons badal sakte hain)
import { Button, ButtonGroup } from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined';
import CelebrationIcon from '@mui/icons-material/Celebration';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import StarIcon from '@mui/icons-material/Star';

export default function ReactionButtons({ shoutoutId, reactionCounts, currentUserReaction, onReact }) {
  
  const handleReact = (reactionType) => {
    onReact(shoutoutId, reactionType);
  };

  // Helper function to show count only if it's > 0
  const count = (type) => reactionCounts[type] > 0 ? reactionCounts[type] : '';

  return (
    <ButtonGroup size="small" aria-label="reaction buttons" sx={{ mt: 1 }}>
      <Button
        startIcon={currentUserReaction === 'like' ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
        onClick={() => handleReact('like')}
      >
        {count('like')}
      </Button>
      
      <Button
        startIcon={currentUserReaction === 'clap' ? <CelebrationIcon /> : <CelebrationOutlinedIcon />}
        onClick={() => handleReact('clap')}
      >
        {count('clap')}
      </Button>
      
      <Button
        startIcon={currentUserReaction === 'star' ? <StarIcon /> : <StarBorderOutlinedIcon />}
        onClick={() => handleReact('star')}
      >
        {count('star')}
      </Button>
    </ButtonGroup>
  );
}