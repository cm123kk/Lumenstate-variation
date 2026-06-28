import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
import {
  products,
  PRODUCT_OPTIONS,
  PRODUCT_TYPES,
  MOUNTING_TYPES,
} from '../../data/products';

export default {
  title: 'Overview/Lumenstate/05 Products Data',
  parameters: {
    layout: 'padded',
  },
};

/** key-value 표 (enum 상수용) */
function KeyValueTable({ data, keyLabel = 'Key', valueLabel = 'Value' }) {
  return (
    <TableContainer sx={{ mb: 4 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, width: '30%' }}>{keyLabel}</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>{valueLabel}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(data).map(([k, v]) => (
            <TableRow key={k}>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{k}</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{String(v)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/** 옵션 세트 표 (glassFinish / hardware / height) */
function OptionsTable({ options }) {
  return (
    <Box sx={{ mb: 4 }}>
      {Object.entries(options).map(([group, list]) => (
        <Box key={group} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontFamily: 'monospace' }}>
            {group}
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: '40%' }}>value</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>label</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.map((o) => (
                  <TableRow key={o.value}>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{o.value}</TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{o.label}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Box>
  );
}

/** 제품 카탈로그 데이터 테이블 */
export const Default = {
  render: () => (
    <>
      <DocumentTitle
        title="Products Data"
        status="Available"
        note="제품 카탈로그 및 옵션/타입 상수"
        brandName="Design System"
        systemName="Lumenstate"
        version="1.0"
      />
      <PageContainer>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Products Data
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          <code>src/data/products.js</code>
        </Typography>

        {/* 제품 카탈로그 */}
        <SectionTitle title="products" description={`${products.length}개 제품 · { id, title, type, mounting, form, lightPattern, lux, kelvin, images[] }`} />
        <TableContainer sx={{ mb: 4 }}>
          <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: 50 }}>id</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 160 }}>title</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 80 }}>type</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 120 }}>mounting</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>form</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>lightPattern</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 60 }}>lux</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 70 }}>kelvin</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 70 }}>images</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{p.id}</TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{p.type}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{p.mounting}</TableCell>
                  <TableCell sx={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.form}</TableCell>
                  <TableCell sx={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.lightPattern}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{p.lux}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{p.kelvin}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{p.images?.length ?? 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 설명 (별도 표 — 길이가 길어 분리) */}
        <SectionTitle title="products.description" description="제품별 긴 설명 문구" />
        <TableContainer sx={{ mb: 4 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: 50 }}>id</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 160 }}>title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{p.id}</TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{p.title}</TableCell>
                  <TableCell sx={{ fontSize: 13, color: 'text.secondary' }}>{p.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 옵션 */}
        <SectionTitle title="PRODUCT_OPTIONS" description="제품 상세에서 선택 가능한 옵션" />
        <OptionsTable options={PRODUCT_OPTIONS} />

        {/* 타입 상수 */}
        <SectionTitle title="PRODUCT_TYPES" description="제품 타입 enum" />
        <KeyValueTable data={PRODUCT_TYPES} />

        <SectionTitle title="MOUNTING_TYPES" description="마운팅 방식 enum" />
        <KeyValueTable data={MOUNTING_TYPES} />
      </PageContainer>
    </>
  ),
};
