# Knitto Table

Komponen tabel yang powerful dan fleksibel untuk menampilkan data dalam format tabel dengan dukungan virtualization, filtering, sorting, dan berbagai fitur lanjutan lainnya.

## 📋 Daftar Isi

- [Instalasi](#instalasi)
- [Penggunaan Dasar](#penggunaan-dasar)
- [Props](#props)
- [Fitur Utama](#fitur-utama)
  - [Header Customization](#header-customization)
  - [Filtering](#filtering)
  - [Sorting](#sorting)
  - [Checkbox Selection](#checkbox-selection)
  - [Expand Row](#expand-row)
  - [Freeze Column](#freeze-column)
  - [Server-Side Filtering](#server-side-filtering)
  - [Regular Table Mode](#regular-table-mode)
  - [Row Span](#row-span)
  - [Row Reorder (Drag & Drop)](#row-reorder-drag--drop)
- [Contoh Penggunaan](#contoh-penggunaan)
- [Tips & Best Practices](#tips--best-practices)

## Instalasi

Komponen sudah tersedia di dalam project. Import langsung dari path alias:

```typescript
import { KnittoTable, type IHeader, type IVirtualTableRef } from '@/components/ui/knitto-table';
```

## Penggunaan Dasar

```typescript
import { KnittoTable, type IHeader } from '@/components/ui/knitto-table';

type User = {
  id: number;
  name: string;
  email: string;
  company: string;
};

const MyTable = () => {
  const data: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', company: 'Acme Inc' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', company: 'Tech Corp' },
  ];

  const headers: IHeader<User>[] = [
    { key: 'id', caption: 'ID', width: 80 },
    { key: 'name', caption: 'Name', width: 200 },
    { key: 'email', caption: 'Email', width: 250 },
    { key: 'company', caption: 'Company', width: 200 },
  ];

  return (
    <div className="h-96">
      <KnittoTable headers={headers} data={data} rowKey="id" />
    </div>
  );
};
```

## Props

### IKnittoTable\<TData\>

| Prop                           | Type                                                                                                                                                                                                                                                                              | Default                                                            | Deskripsi                                                                                                                            |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `headers`                      | `IHeader<TData>[]`                                                                                                                                                                                                                                                                | **required**                                                       | Array definisi kolom tabel                                                                                                           |
| `data`                         | `TData[]`                                                                                                                                                                                                                                                                         | **required**                                                       | Array data yang akan ditampilkan                                                                                                     |
| `rowKey`                       | `keyof TData \| ((data: TData, index: number) => string)`                                                                                                                                                                                                                         | **required**                                                       | Key unik untuk setiap row                                                                                                            |
| `headerMode`                   | `'single' \| 'double'`                                                                                                                                                                                                                                                            | `'double'`                                                         | Mode header (single/double untuk grouping)                                                                                           |
| `isLoading`                    | `boolean`                                                                                                                                                                                                                                                                         | `false`                                                            | Menampilkan loading indicator                                                                                                        |
| `isResetFilter`                | `boolean`                                                                                                                                                                                                                                                                         | `false`                                                            | Reset semua filter ke kondisi awal                                                                                                   |
| `useFooter`                    | `boolean`                                                                                                                                                                                                                                                                         | `false`                                                            | Menampilkan footer tabel                                                                                                             |
| `useAutoSizer`                 | `boolean`                                                                                                                                                                                                                                                                         | `true`                                                             | Auto resize sesuai parent container                                                                                                  |
| `useRegularTable`              | `boolean`                                                                                                                                                                                                                                                                         | `false`                                                            | Gunakan native HTML table elements                                                                                                   |
| `useDynamicRowHeight`          | `boolean`                                                                                                                                                                                                                                                                         | `false`                                                            | Dynamic row height berdasarkan konten                                                                                                |
| `enableColumnVirtualization`   | `boolean`                                                                                                                                                                                                                                                                         | `true`                                                             | Enable column virtualization                                                                                                         |
| `rowHeight`                    | `number`                                                                                                                                                                                                                                                                          | `28`                                                               | Tinggi setiap row (px)                                                                                                               |
| `headerHeight`                 | `number`                                                                                                                                                                                                                                                                          | `32`                                                               | Tinggi header (px)                                                                                                                   |
| `filterHeight`                 | `number`                                                                                                                                                                                                                                                                          | `28`                                                               | Tinggi filter row (px)                                                                                                               |
| `footerHeight`                 | `number`                                                                                                                                                                                                                                                                          | `32`                                                               | Tinggi footer (px)                                                                                                                   |
| `hideHeader`                   | `boolean`                                                                                                                                                                                                                                                                         | `false`                                                            | Sembunyikan header                                                                                                                   |
| `classNameOuterTable`          | `string`                                                                                                                                                                                                                                                                          | -                                                                  | Custom CSS class untuk container                                                                                                     |
| `classNameCell`                | `(data: TData, rowIndex: number, columnIndex: number) => string`                                                                                                                                                                                                                  | -                                                                  | Dynamic CSS class untuk cell                                                                                                         |
| `useSessionFilter`             | `{ tableKey: string }`                                                                                                                                                                                                                                                            | -                                                                  | Simpan filter state di session storage                                                                                               |
| `useServerFilter`              | `{ sort?: boolean, search?: boolean, selection?: boolean, advance?: boolean }`                                                                                                                                                                                                    | `{ sort: false, search: false, selection: false, advance: false }` | Enable server-side filtering                                                                                                         |
| `onClickRow`                   | `(item: TData, rowIndex: number, columnIndex: number, groupOfItems?: TData[]) => void`                                                                                                                                                                                            | -                                                                  | Callback saat row diklik                                                                                                             |
| `onDoubleClickRow`             | `(item: TData, rowIndex: number, columnIndex: number) => void`                                                                                                                                                                                                                    | -                                                                  | Callback saat row di double-click                                                                                                    |
| `onRightClickRow`              | `(item: TData, position: { x: number, y: number }) => void`                                                                                                                                                                                                                       | -                                                                  | Callback saat row di right-click                                                                                                     |
| `onReorderRows`                | `(fromIndex: number, toIndex: number) => void`                                                                                                                                                                                                                                    | -                                                                  | Callback saat urutan row berubah via drag-drop. Ketika disediakan, row menjadi draggable. Mendukung Regular Table dan Virtual Table. |
| `enableReorderFromColumnOnly`  | `boolean`                                                                                                                                                                                                                                                                         | `false`                                                            | Ketika true, reorder hanya bisa dilakukan dari kolom row-reorder. Memerlukan kolom dengan key 'row-reorder' di headers.              |
| `onRenderExpandedContent`      | `(item: TData) => ReactNode`                                                                                                                                                                                                                                                      | -                                                                  | Render konten expanded row                                                                                                           |
| `onChangeCheckboxRowSelection` | `(selectedRows: (string \| number)[], deselectedRows: (string \| number)[], isSelectAll: boolean) => void`                                                                                                                                                                        | -                                                                  | Callback saat checkbox selection berubah                                                                                             |
| `onChangeFilter`               | `{ sort?: (key: keyof TData, sortBy: TSortOrder) => void, search?: (data: Record<keyof TData, string>) => void, selection?: (data: Record<keyof TData, string[]>) => void, advance?: (data: Record<keyof TData, { config_name: TFilterAdvanceConfig, value: string }>) => void }` | -                                                                  | Callback untuk filter changes (server-side)                                                                                          |
| `onScrollTouchBottom`          | `() => void`                                                                                                                                                                                                                                                                      | -                                                                  | Callback saat scroll mencapai bottom                                                                                                 |
| `onScroll`                     | `(scrollTop: number, scrollLeft: number) => void`                                                                                                                                                                                                                                 | -                                                                  | Callback saat tabel di-scroll                                                                                                        |

### IHeader\<TData\>

| Prop                     | Type                                                                                       | Default      | Deskripsi                                          |
| ------------------------ | ------------------------------------------------------------------------------------------ | ------------ | -------------------------------------------------- |
| `key`                    | `keyof TData \| 'expand' \| 'action' \| 'row-selection' \| 'row-reorder' \| string`        | **required** | Key unik kolom                                     |
| `caption`                | `string`                                                                                   | **required** | Teks header kolom                                  |
| `width`                  | `number`                                                                                   | `160`        | Lebar kolom (px)                                   |
| `noStretch`              | `boolean`                                                                                  | `false`      | Prevent column stretching                          |
| `freeze`                 | `'left' \| 'right'`                                                                        | -            | Freeze kolom ke kiri/kanan                         |
| `visible`                | `boolean`                                                                                  | `true`       | Visibility kolom                                   |
| `hideHeaderAction`       | `boolean`                                                                                  | `false`      | Sembunyikan header action buttons                  |
| `hideFilter`             | `{ sort?: boolean, search?: boolean, filterSelection?: boolean, filterAdvance?: boolean }` | -            | Sembunyikan filter tertentu                        |
| `filterSelectionOptions` | `string[]`                                                                                 | -            | Options untuk selection filter                     |
| `renderHeader`           | `() => ReactNode`                                                                          | -            | Custom render header                               |
| `renderCell`             | `(item: TData) => ReactNode`                                                               | -            | Custom render cell                                 |
| `renderExpandToggle`     | `(item: TData, isExpanded: boolean) => ReactNode`                                          | -            | Custom render expand toggle                        |
| `renderFooter`           | `() => ReactNode`                                                                          | -            | Custom render footer                               |
| `children`               | `Omit<IHeader<TData>, 'freeze'>[]`                                                         | -            | Nested columns untuk header grouping               |
| `enableRowSpan`          | `boolean`                                                                                  | `false`      | Enable rowspan merging (hanya untuk regular table) |

## Fitur Utama

### Header Customization

Custom header dengan berbagai opsi:

```typescript
const headers: IHeader<User>[] = [
  {
    key: 'id',
    caption: 'ID',
    width: 80,
    hideFilter: { search: true, filterSelection: true, filterAdvance: true }, // Hide beberapa filter
  },
  {
    key: 'name',
    caption: 'Full Name',
    width: 200,
    renderHeader: () => (
      <div className="flex items-center gap-2">
        <Icon />
        <span>Custom Header</span>
      </div>
    ),
  },
  {
    key: 'salary',
    caption: 'Salary',
    width: 120,
    renderCell: (item) => `$${item.salary.toLocaleString()}`, // Custom cell render
  },
];
```

### Header Grouping

Gunakan `headerMode="double"` dan `children` untuk membuat nested headers:

```typescript
const headers: IHeader<User>[] = [
  {
    key: 'personal',
    caption: 'Personal Information',
    children: [
      { key: 'name', caption: 'Name', width: 150 },
      { key: 'email', caption: 'Email', width: 200 },
      { key: 'phone', caption: 'Phone', width: 150 },
    ],
  },
  {
    key: 'work',
    caption: 'Work Information',
    children: [
      { key: 'company', caption: 'Company', width: 200 },
      { key: 'position', caption: 'Position', width: 150 },
    ],
  },
];

<KnittoTable headers={headers} data={data} rowKey="id" headerMode="double" />
```

### Filtering

Tabel mendukung berbagai jenis filter:

#### 1. Search Filter

Filter berdasarkan teks pencarian per kolom.

#### 2. Selection Filter

Filter dengan dropdown multi-select:

```typescript
const headers: IHeader<User>[] = [
  {
    key: 'status',
    caption: 'Status',
    filterSelectionOptions: ['Active', 'Inactive', 'Pending'], // Options untuk filter
  },
];
```

#### 3. Advanced Filter

Filter dengan operator (equals, contains, startsWith, dll):

```typescript
// Advanced filter otomatis tersedia di setiap kolom
// Operator: none, equal, notEqual, startsWith, endsWith, contains, notContains
```

#### 4. Server-Side Filtering

Untuk filtering di server, gunakan `useServerFilter` dan `onChangeFilter`:

```typescript
<KnittoTable
  headers={headers}
  data={data}
  rowKey="id"
  useServerFilter={{ sort: true, search: true, selection: true, advance: true }}
  onChangeFilter={{
    sort: (key, order) => {
      // Handle sort di server
      fetchData({ sortKey: key, sortOrder: order });
    },
    search: (searchData) => {
      // Handle search di server
      fetchData({ search: searchData });
    },
    selection: (selectionData) => {
      // Handle selection filter di server
      fetchData({ filters: selectionData });
    },
    advance: (advanceData) => {
      // Handle advanced filter di server
      fetchData({ advancedFilters: advanceData });
    },
  }}
/>
```

### Sorting

Sorting otomatis tersedia di setiap kolom. Klik header untuk toggle sort (asc → desc → unset).

Untuk server-side sorting, gunakan `useServerFilter`:

```typescript
useServerFilter={{ sort: true }}
onChangeFilter={{
  sort: (key, sortBy) => {
    // Fetch data dengan sort dari server
    fetchData({ sortKey: key, sortOrder: sortBy });
  },
}}
```

### Checkbox Selection

Enable checkbox selection dengan menambahkan kolom khusus:

```typescript
const headers: IHeader<User>[] = [
  { key: 'row-selection', caption: '', width: 50 }, // Kolom checkbox
  { key: 'id', caption: 'ID', width: 80 },
  { key: 'name', caption: 'Name', width: 200 },
  // ... kolom lainnya
];

<KnittoTable
  headers={headers}
  data={data}
  rowKey="id"
  onChangeCheckboxRowSelection={(selectedRows, deselectedRows, isSelectAll) => {
    console.log('Selected:', selectedRows);
    console.log('Deselected:', deselectedRows);
    console.log('Select All:', isSelectAll);
  }}
/>
```

### Expand Row

Tambahkan kolom expand dan gunakan `onRenderExpandedContent`:

```typescript
const headers: IHeader<User>[] = [
  { key: 'expand', caption: '', width: 50 }, // Kolom expand
  { key: 'id', caption: 'ID', width: 80 },
  { key: 'name', caption: 'Name', width: 200 },
  // ... kolom lainnya
];

<KnittoTable
  headers={headers}
  data={data}
  rowKey="id"
  onRenderExpandedContent={(item) => (
    <div className="p-4 bg-gray-50">
      <h3>Details for {item.name}</h3>
      <p>Email: {item.email}</p>
      <p>Company: {item.company}</p>
    </div>
  )}
/>
```

#### Custom Expand Toggle

Custom tampilan expand toggle:

```typescript
const headers: IHeader<User>[] = [
  {
    key: 'expand',
    caption: '',
    width: 50,
    renderExpandToggle: (item, isExpanded) => (
      <button className="p-1">
        {isExpanded ? <ChevronDown /> : <ChevronRight />}
      </button>
    ),
  },
  // ... kolom lainnya
];
```

### Freeze Column

Freeze kolom ke kiri atau kanan saat scroll horizontal:

```typescript
const headers: IHeader<User>[] = [
  { key: 'id', caption: 'ID', width: 80, freeze: 'left' }, // Freeze ke kiri
  { key: 'name', caption: 'Name', width: 200 },
  { key: 'action', caption: 'Action', width: 100, freeze: 'right' }, // Freeze ke kanan
];
```

**Catatan:** Kolom dengan `children` tidak bisa menggunakan `freeze`.

### Server-Side Filtering

Untuk dataset besar atau filtering kompleks, gunakan server-side filtering:

```typescript
const [data, setData] = useState<User[]>([]);
const [loading, setLoading] = useState(false);

const fetchData = async (filters: FilterParams) => {
  setLoading(true);
  try {
    const response = await api.getUsers(filters);
    setData(response.data);
  } finally {
    setLoading(false);
  }
};

<KnittoTable
  headers={headers}
  data={data}
  rowKey="id"
  isLoading={loading}
  useServerFilter={{ sort: true, search: true, selection: true, advance: true }}
  onChangeFilter={{
    sort: (key, order) => fetchData({ sortKey: key, sortOrder: order }),
    search: (searchData) => fetchData({ search: searchData }),
    selection: (selectionData) => fetchData({ filters: selectionData }),
    advance: (advanceData) => fetchData({ advancedFilters: advanceData }),
  }}
/>
```

### Regular Table Mode

Gunakan native HTML table elements untuk dataset kecil atau ketika perlu standard table semantics:

```typescript
<KnittoTable
  headers={headers}
  data={data}
  rowKey="id"
  useRegularTable={true} // Enable regular table mode
/>
```

**Keuntungan:**

- Standard HTML table semantics (baik untuk accessibility)
- Lebih baik untuk dataset kecil
- Support rowspan (dengan `enableRowSpan`)

**Keterbatasan:**

- Tidak ada virtualization (tidak cocok untuk dataset besar)
- Performance lebih lambat untuk banyak data

### Row Span

Enable rowspan merging untuk kolom dengan nilai duplikat berturut-turut (hanya untuk regular table):

```typescript
const headers: IHeader<User>[] = [
  {
    key: 'category',
    caption: 'Category',
    enableRowSpan: true, // Enable rowspan
    hideFilter: { sort: true }, // Disarankan disable sort
  },
  { key: 'name', caption: 'Name', width: 200 },
  // ... kolom lainnya
];

<KnittoTable
  headers={headers}
  data={sortedData} // Data harus sudah di-sort berdasarkan kolom rowspan
  rowKey="id"
  useRegularTable={true} // Wajib menggunakan regular table
/>
```

**Catatan:** Data harus sudah di-sort berdasarkan kolom yang menggunakan rowspan untuk hasil yang benar.

### Row Reorder (Drag & Drop)

Enable drag and drop untuk menukar posisi row. Mendukung Regular Table dan Virtual Table:

```typescript
const [data, setData] = useState<User[]>(() => generateUserData(20));

const handleReorderRows = useCallback((fromIndex: number, toIndex: number) => {
  setData((prev) => {
    const next = [...prev];
    [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
    return next;
  });
}, []);

<KnittoTable
  data={data}
  headers={headers}
  rowKey="id"
  onReorderRows={handleReorderRows}
  useRegularTable // opsional, juga berfungsi tanpa ini (virtual table)
/>
```

**Catatan:** Data harus berupa state agar bisa di-update. Indeks `fromIndex` dan `toIndex` merujuk ke data yang ditampilkan (setelah filter).

#### Reorder dengan Kolom Khusus

Jika ingin reorder hanya bisa dilakukan dari kolom drag handle (bukan dari seluruh baris), gunakan `enableReorderFromColumnOnly` dan tambahkan kolom `row-reorder`:

```typescript
const headers: IHeader<User>[] = [
  { key: 'row-reorder', caption: '', width: 40 },
  { key: 'id', caption: 'ID', width: 80 },
  { key: 'name', caption: 'Name', width: 200 },
  // ... kolom lainnya
];

<KnittoTable
  data={data}
  headers={headers}
  rowKey="id"
  onReorderRows={handleReorderRows}
  enableReorderFromColumnOnly={true}
/>
```

Ketika `enableReorderFromColumnOnly` true, reorder hanya berfungsi saat user drag dari ikon drag handle di kolom row-reorder. Reorder dari baris lain akan dinonaktifkan.

## Contoh Penggunaan

### Contoh Lengkap dengan Filtering dan Selection

```typescript
import { useMemo, useState } from 'react';
import { KnittoTable, type IHeader } from '@/components/ui/knitto-table';

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
};

const ProductTable = () => {
  const [data] = useState<Product[]>([
    { id: 1, name: 'Product A', category: 'Electronics', price: 100, stock: 50, status: 'active' },
    { id: 2, name: 'Product B', category: 'Clothing', price: 50, stock: 100, status: 'active' },
    // ... more data
  ]);

  const headers: IHeader<Product>[] = useMemo(
    () => [
      { key: 'row-selection', caption: '', width: 50 },
      { key: 'id', caption: 'ID', width: 80, hideFilter: { search: true, filterSelection: true, filterAdvance: true } },
      { key: 'name', caption: 'Product Name', width: 200 },
      {
        key: 'category',
        caption: 'Category',
        width: 150,
        filterSelectionOptions: ['Electronics', 'Clothing', 'Food'],
      },
      {
        key: 'price',
        caption: 'Price',
        width: 120,
        renderCell: (item) => `$${item.price.toLocaleString()}`,
      },
      { key: 'stock', caption: 'Stock', width: 100 },
      {
        key: 'status',
        caption: 'Status',
        width: 120,
        filterSelectionOptions: ['active', 'inactive'],
        renderCell: (item) => (
          <span className={item.status === 'active' ? 'text-green-600' : 'text-red-600'}>
            {item.status}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="h-[600px]">
      <KnittoTable
        headers={headers}
        data={data}
        rowKey="id"
        headerMode="double"
        rowHeight={32}
        headerHeight={40}
        filterHeight={32}
        onChangeCheckboxRowSelection={(selected, deselected, isSelectAll) => {
          console.log('Selected rows:', selected);
        }}
      />
    </div>
  );
};
```

### Contoh dengan Expand Row dan Nested Table

```typescript
const OrderTable = () => {
  const headers: IHeader<Order>[] = [
    { key: 'expand', caption: '', width: 50 },
    { key: 'orderId', caption: 'Order ID', width: 120 },
    { key: 'customer', caption: 'Customer', width: 200 },
    { key: 'total', caption: 'Total', width: 120 },
  ];

  const renderExpandedContent = (order: Order) => (
    <div className="p-4 bg-gray-50">
      <h3 className="font-semibold mb-2">Order Items</h3>
      <div className="h-64">
        <KnittoTable
          headers={orderItemHeaders}
          data={order.items}
          rowKey="id"
          headerMode="single"
          rowHeight={28}
          headerHeight={32}
          filterHeight={0}
        />
      </div>
    </div>
  );

  return (
    <div className="h-[500px]">
      <KnittoTable
        headers={headers}
        data={orders}
        rowKey="orderId"
        onRenderExpandedContent={renderExpandedContent}
      />
    </div>
  );
};
```

### Contoh dengan Server-Side Filtering dan Pagination

```typescript
const ServerFilteredTable = () => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(100);

  const fetchData = useCallback(
    async (filters?: FilterParams) => {
      setLoading(true);
      try {
        const response = await api.getUsers({
          page,
          perPage,
          ...filters,
        });
        setData(response.data);
      } finally {
        setLoading(false);
      }
    },
    [page, perPage]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="h-[500px]">
        <KnittoTable
          headers={headers}
          data={data}
          rowKey="id"
          isLoading={loading}
          useServerFilter={{ sort: true, search: true, selection: true, advance: true }}
          onChangeFilter={{
            sort: (key, order) => fetchData({ sortKey: key, sortOrder: order }),
            search: (searchData) => fetchData({ search: searchData }),
            selection: (selectionData) => fetchData({ filters: selectionData }),
            advance: (advanceData) => fetchData({ advancedFilters: advanceData }),
          }}
        />
      </div>
      <Pagination
        page={page}
        perPage={perPage}
        totalData={totalData}
        onApplyPage={setPage}
        onApplyPerPage={setPerPage}
      />
    </>
  );
};
```

### Contoh dengan Ref untuk Programmatic Control

```typescript
import { useRef } from 'react';
import { KnittoTable, type IVirtualTableRef } from '@/components/ui/knitto-table';

const ControlledTable = () => {
  const tableRef = useRef<IVirtualTableRef>(null);

  const scrollToTop = () => {
    tableRef.current?.scrollElement?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToIndex = (index: number) => {
    tableRef.current?.virtualizer?.scrollToIndex(index, { align: 'start', behavior: 'smooth' });
  };

  return (
    <>
      <div className="flex gap-2 mb-4">
        <button onClick={scrollToTop}>Scroll to Top</button>
        <button onClick={() => scrollToIndex(50)}>Scroll to Row 50</button>
      </div>
      <div className="h-[500px]">
        <KnittoTable ref={tableRef} headers={headers} data={data} rowKey="id" />
      </div>
    </>
  );
};
```

## Tips & Best Practices

### 1. Performance

- **Gunakan Virtual Table** (default) untuk dataset besar (>100 rows)
- **Gunakan Regular Table** hanya untuk dataset kecil atau ketika perlu rowspan
- **Disable column virtualization** jika menggunakan `useDynamicRowHeight`
- **Gunakan `useMemo`** untuk headers yang kompleks

### 2. Filtering

- **Client-side filtering** untuk dataset kecil (<1000 rows)
- **Server-side filtering** untuk dataset besar atau filtering kompleks
- **Session filter** untuk menyimpan state filter saat user navigasi
- **Disable filter** yang tidak diperlukan dengan `hideFilter`

### 3. Row Key

- **Selalu gunakan unique key** untuk setiap row
- **Gunakan property key** jika tersedia (lebih performant)
- **Gunakan function** jika perlu composite key

```typescript
// ✅ Good - menggunakan property key
rowKey="id"

// ✅ Good - menggunakan function untuk composite key
rowKey={(item, index) => `${item.id}-${index}`}

// ❌ Bad - jangan gunakan index saja
rowKey={(item, index) => index.toString()}
```

### 4. Header Configuration

- **Definisikan width** untuk setiap kolom untuk konsistensi
- **Gunakan `noStretch`** untuk kolom yang tidak boleh di-stretch
- **Gunakan `freeze`** untuk kolom penting yang harus selalu terlihat
- **Gunakan `hideFilter`** untuk menyembunyikan filter yang tidak diperlukan

### 5. Custom Rendering

- **Gunakan `renderCell`** untuk custom cell content
- **Gunakan `renderHeader`** untuk custom header
- **Gunakan `renderFooter`** untuk summary atau totals
- **Gunakan `classNameCell`** untuk conditional styling

### 6. Expand Row

- **Gunakan untuk detail information** yang tidak perlu selalu terlihat
- **Gunakan nested table** untuk hierarchical data
- **Custom toggle** untuk UX yang lebih baik

### 7. Error Handling

- **Handle loading state** dengan `isLoading` prop
- **Handle empty data** dengan menampilkan pesan yang sesuai
- **Handle filter errors** di server-side filtering

### 8. Accessibility

- **Gunakan regular table mode** jika perlu standard table semantics
- **Tambahkan aria labels** jika diperlukan
- **Pastikan keyboard navigation** berfungsi dengan baik

## Referensi

- [TanStack Virtual](https://tanstack.com/virtual/latest) - Library virtualization yang digunakan
- [React Virtualized AutoSizer](https://github.com/bvaughn/react-virtualized-auto-sizer) - Auto sizing component
