import { HomeLayout } from '@/components/layout/home';
import { baseOptions } from '@/lib/layout.shared';
import { MapIcon, BookIcon, NewspaperIcon, NotebookTextIcon, CogIcon, BoxIcon, PackageIcon, FlaskConicalIcon, InfoIcon } from 'lucide-react';

export default function Layout({ children }: LayoutProps<'/'>) {
  const base = baseOptions()

  return <HomeLayout
    {...base}

    links={[
      {
        text: 'Documentation',
        description: 'Fast JavaScript runtime',
        url: '/docs',
        icon: <NotebookTextIcon />,
        type: 'main'
      },
      {
        text: 'Guides',
        description: 'Practical guides and examples',
        url: '/guides',
        icon: <MapIcon />,
      },
      {
        text: 'Reference',
        description: 'TypeScript API reference',
        url: '/reference',
        icon: <BookIcon />,
      },
      {
        text: 'Blog',
        description: 'Latest news and updates',
        url: '/blog',
        active: "nested-url",
        icon: <NewspaperIcon />,
      },
      ...(base.links ?? []),
    ]}
    searchToggle={{ enabled: false }}
  >
    {children}
  </HomeLayout >;
}



// const iconTransform = (icon: React.ReactNode) => {
//   return (
//     <div className="size-4 [&_svg]:size-full max-sm:text-fd-muted-foreground">
//       {icon}
//     </div>
//   );
// };

export const revalidate = false;
