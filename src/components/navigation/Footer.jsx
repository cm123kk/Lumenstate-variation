import { forwardRef, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import { ArrowRight } from 'lucide-react';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';

import { content } from '../../data/content';

/**
 * Footer 컴포넌트
 *
 * 뉴스레터 구독 폼이 포함된 미니멀한 Footer.
 * Lumenstate 브랜드 아이덴티티에 맞춘 절제된 디자인.
 *
 * 동작 방식:
 * 1. 양쪽 정렬: 뉴스레터 (좌) | 로고 + SNS (우)
 * 2. 모바일에서는 column으로 스택
 * 3. 제출 시 onSubscribe 콜백 호출
 *
 * Props:
 * @param {function} onSubscribe - 뉴스레터 구독 핸들러 (email) => void [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <Footer onSubscribe={(email) => console.log(email)} />
 */
const Footer = forwardRef(function Footer({
  onSubscribe,
  sx,
  ...props
}, ref) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const brandName = content.brand.name;
  const tagline = content.brand.tagline;
  const copyright = content.footer.copyright;

  /**
   * 뉴스레터 구독 제출 핸들러
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      onSubscribe?.(email);
      setIsSubmitted(true);
      setEmail('');
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  return (
    <Box
      ref={ref}
      component="footer"
      sx={{
        position: 'relative',
        color: 'text.primary',
        py: { xs: 5, md: 6 },
        px: { xs: 3, md: 6 },
        ...sx,
      }}
      {...props}
    >
      {/* 메인 레이아웃: Newsletter (좌) | Logo + SNS (우) */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'flex-start' }}
        spacing={{ xs: 5, md: 0 }}
        sx={{ position: 'relative', zIndex: 1 }}
      >
        {/* 뉴스레터 */}
        <Box sx={{ width: { xs: '100%', md: 'auto' }, minWidth: { md: 280 } }}>
          <Typography
            variant="overline"
            sx={{
              color: 'text.primary',
              letterSpacing: '0.15em',
              fontSize: '0.65rem',
              mb: 1.5,
              display: 'block',
            }}
          >
            Newsletter
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'text.primary',
              pb: 0.5,
              transition: 'border-color 300ms ease',
              '&:focus-within': {
                borderColor: 'secondary.main',
              },
            }}
          >
            <InputBase
              type="email"
              placeholder={isSubmitted ? 'Subscribed' : 'Enter your email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitted}
              sx={{
                flex: 1,
                color: 'text.primary',
                fontSize: '0.85rem',
                '& input': {
                  p: 0,
                  '&::placeholder': {
                    color: isSubmitted ? 'secondary.main' : 'text.primary',
                    opacity: 1,
                  },
                },
              }}
            />
            <IconButton
              type="submit"
              disabled={isSubmitted || !email}
              sx={{
                color: 'text.primary',
                p: 0.5,
                transition: 'color 300ms ease',
                '&:hover': {
                  color: 'secondary.main',
                  backgroundColor: 'transparent',
                },
                '&.Mui-disabled': {
                  color: 'text.primary',
                },
              }}
            >
              <ArrowRight size={18} strokeWidth={1.5} />
            </IconButton>
          </Box>
        </Box>

        {/* 로고 + SNS 그룹 */}
        <Stack
          direction="row"
          spacing={{ xs: 4, md: 6 }}
          alignItems="flex-start"
        >
          {/* 브랜드 로고 + 태그라인 */}
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                fontSize: '0.85rem',
                mb: 1.5,
              }}
            >
              {tagline}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              {brandName}
            </Typography>
          </Box>

          {/* 소셜 미디어 */}
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: 'text.primary',
                letterSpacing: '0.15em',
                fontSize: '0.65rem',
                mb: 1.5,
                display: 'block',
              }}
            >
              Follow Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, ml: -1 }}>
              <IconButton
                size="small"
                sx={{
                  color: 'text.primary',
                  transition: 'color 300ms ease',
                  '&:hover': {
                    color: 'secondary.main',
                    backgroundColor: 'transparent',
                  },
                }}
              >
                <InstagramIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: 'text.primary',
                  transition: 'color 300ms ease',
                  '&:hover': {
                    color: 'secondary.main',
                    backgroundColor: 'transparent',
                  },
                }}
              >
                <XIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Box>
        </Stack>
      </Stack>

      {/* 저작권 */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          mt: { xs: 5, md: 6 },
          pt: 3,
          borderTop: '1px solid',
          borderColor: 'text.primary',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'text.primary',
            fontSize: '0.7rem',
            letterSpacing: '0.02em',
          }}
        >
          {copyright}
        </Typography>
      </Box>
    </Box>
  );
});

export { Footer };
export default Footer;
