import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import {
  DocumentTitle,
  PageContainer,
  SectionTitle,
} from '../../components/storybookDocumentation';

export default {
  title: 'Overview/UX Flow',
  parameters: {
    layout: 'padded',
  },
};

export const Default = {
  render: () => {
    return (
      <>
        <DocumentTitle
          title="Lumenstate UX Flow"
          status="Available"
          note="Page structure and user journey documentation"
          brandName="Lumenstate"
          systemName="Brand Guide"
          version="1.0"
        />
        <PageContainer>
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            Lumenstate UX Flow
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
            환경 반응형 조명 브랜드 Lumenstate의 페이지 구조와 사용자 여정을 정의합니다.
          </Typography>

          <SectionTitle title="Page Structure" />
          <Stack direction="row" spacing={ 1 } sx={ { mb: 4, flexWrap: 'wrap', gap: 1 } }>
            <Chip label="Header" />
            <Chip label="Hero Section" />
            <Chip label="Brand Value Section" />
            <Chip label="Product Showcase Section" />
          </Stack>

          <Divider sx={ { my: 3 } } />

          <SectionTitle title="1. Header" description="사용자가 페이지 어디에 있든 상단에 고정 노출" />
          <Box component="ul" sx={ { pl: 2, mb: 4 } }>
            <li>
              <Typography variant="body2"><strong>로고:</strong> 브랜드 인지</Typography>
            </li>
            <li>
              <Typography variant="body2"><strong>실시간 시계:</strong> 현재 시간 표시, 낮/밤 아이콘으로 시간대 인지</Typography>
            </li>
            <li>
              <Typography variant="body2"><strong>타임라인 아이콘:</strong> 스크롤 후 표시. 시간대 빠른 전환 제공</Typography>
            </li>
          </Box>

          <SectionTitle title="2. Hero Section" description="첫 화면. 브랜드 메시지와 제품 분위기 전달" />
          <Typography variant="subtitle2" sx={ { fontWeight: 600, mb: 1 } }>정보 전달 순서</Typography>
          <Box component="ol" sx={ { pl: 2, mb: 2 } }>
            <li><Typography variant="body2">브랜드명 "Lumenstate"</Typography></li>
            <li><Typography variant="body2">태그라인 "Light defines the space."</Typography></li>
            <li><Typography variant="body2">무드보드 에디토리얼 이미지로 조명이 공간에 미치는 영향 시각화 (8:4 그리드)</Typography></li>
          </Box>
          <Typography variant="subtitle2" sx={ { fontWeight: 600, mb: 1 } }>인터랙션</Typography>
          <Box component="ul" sx={ { pl: 2, mb: 4 } }>
            <li><Typography variant="body2">타임라인에 따라 무드보드 이미지가 낮 ↔ 밤 버전으로 크로스페이드 (TimeBlendImage)</Typography></li>
            <li><Typography variant="body2">좌측 상단에 브랜드명/태그라인 오버레이</Typography></li>
          </Box>

          <SectionTitle title="3. Brand Value Section" description="브랜드의 3가지 핵심 가치 전달" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>가치</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>설명</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Immanence</TableCell>
                  <TableCell>공간에 스며드는 빛</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Continuity</TableCell>
                  <TableCell>자연스러운 낮 → 밤 전환</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Flexibility</TableCell>
                  <TableCell>자동화와 수동 제어의 균형</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 4 } }>
            인터랙션: 없음 (정적 콘텐츠)
          </Typography>

          <SectionTitle title="4. Product Showcase Section" description="제품 탐색 및 시간대별 조명 변화 체험" />
          <Typography variant="subtitle2" sx={ { fontWeight: 600, mb: 1 } }>정보 전달 순서</Typography>
          <Box component="ol" sx={ { pl: 2, mb: 3 } }>
            <li><Typography variant="body2">섹션 타이틀 "Product Showcase"</Typography></li>
            <li><Typography variant="body2">타임라인 슬라이더 (시간대 선택 UI)</Typography></li>
            <li><Typography variant="body2">제품 필터 (타입별 분류)</Typography></li>
            <li><Typography variant="body2">제품 그리드</Typography></li>
          </Box>

          <Typography variant="subtitle2" sx={ { fontWeight: 600, mb: 1 } }>시간대별 테마 전환</Typography>
          <TableContainer sx={ { mb: 3 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>시간</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>배경</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>텍스트</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>제품 사진</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>12:00pm (정오)</TableCell>
                  <TableCell>밝은 배경</TableCell>
                  <TableCell>어두운 텍스트</TableCell>
                  <TableCell>낮 버전</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>4:00pm (오후)</TableCell>
                  <TableCell>밝은 배경 유지</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>8:00pm (저녁)</TableCell>
                  <TableCell>어두운 배경</TableCell>
                  <TableCell>밝은 텍스트</TableCell>
                  <TableCell>밤 버전</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>12:00am (자정)</TableCell>
                  <TableCell>어두운 배경 유지</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle2" sx={ { fontWeight: 600, mb: 1 } }>인터랙션</Typography>
          <Box component="ul" sx={ { pl: 2, mb: 4 } }>
            <li><Typography variant="body2">타임라인 슬라이더 조작 시 제품 사진이 낮 → 밤 버전으로 크로스페이드</Typography></li>
            <li><Typography variant="body2">타임라인 슬라이더 조작 시 페이지 배경색이 밝은색 → 어두운색으로 전환</Typography></li>
            <li><Typography variant="body2">타임라인 슬라이더 조작 시 텍스트 색상이 배경에 맞춰 반전</Typography></li>
            <li><Typography variant="body2">타임라인 아이콘 클릭 시 해당 시간대로 즉시 이동</Typography></li>
            <li><Typography variant="body2">필터 클릭 시 선택한 타입의 제품만 표시</Typography></li>
            <li><Typography variant="body2">슬라이더가 화면 밖으로 스크롤되면 헤더에 미니 타임라인 표시</Typography></li>
          </Box>

          <Divider sx={ { my: 3 } } />

          <SectionTitle title="User Journey" />
          <Box component="ol" sx={ { pl: 2, mb: 4 } }>
            <li><Typography variant="body2">진입</Typography></li>
            <li><Typography variant="body2">브랜드 인지 (Hero - 로고, 태그라인)</Typography></li>
            <li><Typography variant="body2">제품 분위기 체험 (Hero - 무드보드 이미지 낮 ↔ 밤 크로스페이드)</Typography></li>
            <li><Typography variant="body2">브랜드 철학 이해 (Brand Value - 3가지 핵심 가치)</Typography></li>
            <li><Typography variant="body2">제품 탐색 (Product Showcase - 필터로 카테고리 선택)</Typography></li>
            <li><Typography variant="body2">시간대별 변화 체험 (Product Showcase - 슬라이더로 낮/밤 전환)</Typography></li>
          </Box>

          <SectionTitle title="Key Interactions" />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>인터랙션</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>영역</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>동작</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>타임라인</TableCell>
                  <TableCell>Hero</TableCell>
                  <TableCell>무드보드 이미지가 낮 ↔ 밤 크로스페이드</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>타임라인 드래그</TableCell>
                  <TableCell>Product Showcase</TableCell>
                  <TableCell>제품 사진 + 배경색 + 텍스트색 동시 전환</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>타임라인 아이콘 클릭</TableCell>
                  <TableCell>Product Showcase</TableCell>
                  <TableCell>4단계 시간대 중 하나로 즉시 이동</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>필터 선택</TableCell>
                  <TableCell>Product Showcase</TableCell>
                  <TableCell>제품 그리드 필터링</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </PageContainer>
      </>
    );
  },
};
