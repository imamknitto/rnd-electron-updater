import { memo } from 'react';
import type { IIconProps } from '../lib';

import type { IconSortProps } from './ic-sort';
import IcClose from './ic-close';
import IcChevron from './ic-chevon';
import IcColumn from './ic-column';
import IcCopy from './ic-copy';
import IcDelete from './ic-delete';
import IcDotsVertical from './ic-dots-vertical';
import IcFilterAdvance from './ic-filter-advance';
import IcFilterMultiple from './ic-filter-multiple';
import IcSearch from './ic-search';
import IcMenu from './ic-menu';
import IcCheck from './ic-check';
import IcSort from './ic-sort';

export const icons = {
  close: (props: IIconProps) => <IcClose {...props} />,
  chevron: (prop: IIconProps) => <IcChevron {...prop} />,
  column: (prop: IIconProps) => <IcColumn {...prop} />,
  copy: (prop: IIconProps) => <IcCopy {...prop} />,
  sort: (prop: IconSortProps) => <IcSort {...prop} />,
  delete: (prop: IIconProps) => <IcDelete {...prop} />,
  dotsVertical: (prop: IIconProps) => <IcDotsVertical {...prop} />,
  filterAdvance: (prop: IIconProps) => <IcFilterAdvance {...prop} />,
  filterMultiple: (prop: IIconProps) => <IcFilterMultiple {...prop} />,
  search: (prop: IIconProps) => <IcSearch {...prop} />,
  menu: (prop: IIconProps) => <IcMenu {...prop} />,
  check: (prop: IIconProps) => <IcCheck {...prop} />,
};

type IconName = keyof typeof icons;

type IconProps<Name extends IconName> = Name extends 'sort'
  ? React.ComponentProps<(typeof icons)['sort']>
  : React.ComponentProps<(typeof icons)[Name]>;

type Props<Name extends IconName = IconName> = {
  name: Name;
} & IconProps<Name>;

function Icon<Name extends IconName>({ name, ...rest }: Props<Name>) {
  const Component = icons[name];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Component {...(rest as any)} />;
}

export default memo(Icon) as <Name extends IconName>(props: Props<Name>) => React.ReactNode;
