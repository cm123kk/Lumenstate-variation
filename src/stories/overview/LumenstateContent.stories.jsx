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
import { content } from '../../data/content';

export default {
  title: 'Overview/Lumenstate/06 Content Data',
  parameters: {
    layout: 'padded',
  },
};

/** 단순 key-value 표 */
function KeyValueTable({ data, keyLabel = 'key', valueLabel = 'value' }) {
  return (
    <TableContainer sx={ { mb: 4 } }>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={ { fontWeight: 600, width: '30%' } }>{ keyLabel }</TableCell>
            <TableCell sx={ { fontWeight: 600 } }>{ valueLabel }</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { Object.entries(data).map(([k, v]) => (
            <TableRow key={ k }>
              <TableCell sx={ { fontFamily: 'monospace', fontSize: 13 } }>{ k }</TableCell>
              <TableCell sx={ { fontSize: 13 } }>{ String(v) }</TableCell>
            </TableRow>
          )) }
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/** 객체 배열 표 — columns 는 표에 표시할 컬럼 명 */
function ArrayTable({ rows, columns }) {
  return (
    <TableContainer sx={ { mb: 4 } }>
      <Table size="small">
        <TableHead>
          <TableRow>
            { columns.map((c) => (
              <TableCell key={ c } sx={ { fontWeight: 600 } }>{ c }</TableCell>
            )) }
          </TableRow>
        </TableHead>
        <TableBody>
          { rows.map((r, i) => (
            <TableRow key={ i } sx={ { '&:hover': { backgroundColor: 'action.hover' } } }>
              { columns.map((c) => (
                <TableCell key={ c } sx={ { fontSize: 13, verticalAlign: 'top' } }>
                  { typeof r[c] === 'string' ? r[c] : JSON.stringify(r[c]) }
                </TableCell>
              )) }
            </TableRow>
          )) }
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/** 브랜드 콘텐츠 데이터 테이블 */
export const Default = {
  render: () => {
    const { brand, navigation, hero, brandValue, products, footer } = content;

    // 무드보드 이미지 (path 만 추출해서 표로 표시)
    const moodboardRows = [
      { slot: 'hero', day: hero.moodboard.hero, night: hero.moodboard.heroNight },
      { slot: 'side', day: hero.moodboard.side, night: hero.moodboard.sideNight },
      ...(hero.moodboard.gallery || []).map((g, i) => ({
        slot: `gallery[${i}]`,
        day: g.src,
        night: g.srcNight,
      })),
    ];

    const galleryAltRows = (hero.moodboard.gallery || []).map((g, i) => ({
      index: String(i),
      alt: g.alt,
    }));

    return (
      <>
        <DocumentTitle
          title="Content Data"
          status="Available"
          note="브랜드 카피 · 네비 · 히어로 · 브랜드 가치 · 푸터"
          brandName="Design System"
          systemName="Lumenstate"
          version="1.0"
        />
        <PageContainer>
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            Content Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={ { mb: 4 } }>
            <code>src/data/content.js</code>
          </Typography>

          {/* brand */}
          <SectionTitle title="brand" description="브랜드 기본 정보" />
          <KeyValueTable data={ brand } />

          {/* navigation */}
          <SectionTitle title="navigation.menuItems" description="GNB 메뉴 항목" />
          <ArrayTable rows={ navigation.menuItems } columns={ ['id', 'label', 'path'] } />

          {/* hero */}
          <SectionTitle title="hero" description="히어로 섹션 타이틀·서브타이틀" />
          <KeyValueTable data={ { title: hero.title, subtitle: hero.subtitle } } />

          <SectionTitle title="hero.moodboard" description="무드보드 이미지 (Day/Night 페어)" />
          <TableContainer sx={ { mb: 2 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>slot</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>day</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>night</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                { moodboardRows.map((r) => (
                  <TableRow key={ r.slot }>
                    <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ r.slot }</TableCell>
                    <TableCell sx={ { fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' } }>{ r.day }</TableCell>
                    <TableCell sx={ { fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' } }>{ r.night }</TableCell>
                  </TableRow>
                )) }
              </TableBody>
            </Table>
          </TableContainer>

          { galleryAltRows.length > 0 && (
            <>
              <SectionTitle title="hero.moodboard.gallery.alt" description="갤러리 이미지 alt 텍스트" />
              <ArrayTable rows={ galleryAltRows } columns={ ['index', 'alt'] } />
            </>
          ) }

          {/* brandValue */}
          <SectionTitle title="brandValue.features" description="브랜드 3가치 카드 (Immanence / Continuity / Flexibility)" />
          <ArrayTable
            rows={ brandValue.features }
            columns={ ['id', 'icon', 'title', 'description', 'detailedDescription'] }
          />

          {/* products section copy */}
          <SectionTitle title="products" description="제품 쇼케이스 섹션 헤드 카피" />
          <KeyValueTable data={ products } />

          {/* footer */}
          <SectionTitle title="footer" description="푸터" />
          <KeyValueTable data={ footer } />
        </PageContainer>
      </>
    );
  },
};
