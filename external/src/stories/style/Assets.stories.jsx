import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {
  DocumentTitle,
  PageContainer,
  SectionTitle,
} from '../../components/storybookDocumentation';
import { products } from '../../data/products';

export default {
  title: 'Style/Assets',
  parameters: {
    layout: 'padded',
  },
};

/** 제품 상세 카드 - 낮/밤 이미지 */
const ProductDetailCard = ({ product }) => (
  <Box
    sx={ {
      border: '1px solid',
      borderColor: 'divider',
      mb: 4,
    } }
  >
    {/* 헤더 */}
    <Box sx={ { p: 2, borderBottom: '1px solid', borderColor: 'divider' } }>
      <Typography variant="h6" sx={ { fontWeight: 600 } }>
        { product.title }
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={ { fontFamily: 'monospace' } }>
        ID: { product.id } · { product.type } · { product.lux } lx · { product.kelvin } K
      </Typography>
    </Box>

    {/* 에셋 그리드 */}
    <Grid container>
      {/* 낮 이미지 */}
      <Grid size={ { xs: 12, md: 6 } }>
        <Box sx={ { p: 1 } }>
          <Typography variant="caption" sx={ { fontWeight: 600, mb: 1, display: 'block' } }>
            Day
          </Typography>
          <Box sx={ { aspectRatio: '1', backgroundColor: '#F5F2EE' } }>
            { product.images?.[0] && (
              <Box
                component="img"
                src={ product.images[0] }
                alt={ `${ product.title } - Day` }
                sx={ { width: '100%', height: '100%', objectFit: 'cover' } }
              />
            ) }
          </Box>
        </Box>
      </Grid>

      {/* 밤 이미지 */}
      <Grid size={ { xs: 12, md: 6 } }>
        <Box sx={ { p: 1 } }>
          <Typography variant="caption" sx={ { fontWeight: 600, mb: 1, display: 'block' } }>
            Night
          </Typography>
          <Box sx={ { aspectRatio: '1', backgroundColor: '#12100E' } }>
            { product.images?.[1] && (
              <Box
                component="img"
                src={ product.images[1] }
                alt={ `${ product.title } - Night` }
                sx={ { width: '100%', height: '100%', objectFit: 'cover' } }
              />
            ) }
          </Box>
        </Box>
      </Grid>
    </Grid>
  </Box>
);

/** Docs - 제품 에셋 문서 */
export const Docs = {
  render: () => {
    return (
      <>
        <DocumentTitle
          title="Product Assets"
          status="Available"
          note="Product images (Day/Night)"
          brandName="Lumenstate"
          systemName="Design System"
          version="1.0"
        />
        <PageContainer>
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            Product Assets
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
            Lumenstate 제품 이미지 에셋입니다. 각 제품은 Day/Night 이미지 쌍으로 구성됩니다.
          </Typography>

          {/* 에셋 요약 */}
          <SectionTitle title="Summary" description="에셋 현황" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600, width: 200 } }>Total Products</TableCell>
                  <TableCell>{ products.length }</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Image Format</TableCell>
                  <TableCell sx={ { fontFamily: 'monospace' } }>.png (Day + Night per product)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Total Images</TableCell>
                  <TableCell>{ products.length * 2 }</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* 제품별 에셋 */}
          <SectionTitle title="Product Assets" description="제품별 낮/밤 이미지" />
          { products.map((product) => (
            <ProductDetailCard key={ product.id } product={ product } />
          )) }

          {/* 제품 데이터 테이블 */}
          <SectionTitle title="Product Data" description="제품 상세 정보" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>ID</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>Title</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>Type</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>Lux</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>Kelvin</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                { products.map((product) => (
                  <TableRow key={ product.id }>
                    <TableCell sx={ { fontFamily: 'monospace' } }>{ product.id }</TableCell>
                    <TableCell>{ product.title }</TableCell>
                    <TableCell sx={ { fontFamily: 'monospace' } }>{ product.type }</TableCell>
                    <TableCell sx={ { fontFamily: 'monospace' } }>{ product.lux }</TableCell>
                    <TableCell sx={ { fontFamily: 'monospace' } }>{ product.kelvin }</TableCell>
                  </TableRow>
                )) }
              </TableBody>
            </Table>
          </TableContainer>

          {/* 사용 예시 */}
          <SectionTitle title="Usage" description="에셋 import 방법" />
          <Box
            component="pre"
            sx={ {
              backgroundColor: 'grey.100',
              p: 2,
              fontSize: 12,
              fontFamily: 'monospace',
              overflow: 'auto',
            } }
          >
{ `// 제품 데이터 import
import { products } from '../data/products';

// 개별 제품 사용
const product = products[0];
<img src={product.images[0]} alt={product.title} />

// 제품 리스트
products.map((p) => (
  <ProductCard
    key={p.id}
    title={p.title}
    image={p.images[0]}
    lux={p.lux}
    kelvin={p.kelvin}
  />
))` }
          </Box>
        </PageContainer>
      </>
    );
  },
};
