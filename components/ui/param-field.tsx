import type { ReactNode } from 'react';

export interface ParamFieldProps {
  name: string;
  type: string;
  required?: boolean;
  deprecated?: boolean;
  default?: string | number | boolean;
  children?: ReactNode;
}

export function ParamField({
  name,
  type,
  required = false,
  deprecated = false,
  default: defaultValue,
  children,
}: ParamFieldProps) {

  return (
    <div className="pt-2.5 border-b">
      <div className="flex font-mono text-sm break-all items-center flex-wrap gap-2 flex-1 content-start py-0.5 mr-5">
        <div className="font-semibold text-fd-primary overflow-wrap-anywhere">
          {name}
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="items-center px-2 py-0.5 rounded-md bg-fd-secondary text-fd-secondary-foreground font-medium break-all"     >
            {type}
          </span>
          {required && (
            <span className="px-2 py-0.5 rounded-md bg-red-100/50 dark:bg-red-400/10 text-red-600 dark:text-red-300 font-medium whitespace-nowrap">
              required
            </span>
          )}
          {deprecated && (
            <span className="px-2 py-0.5 rounded-md bg-yellow-100/50 dark:bg-yellow-400/10 text-yellow-600 dark:text-yellow-300 font-medium whitespace-nowrap">
              deprecated
            </span>
          )}
          {defaultValue !== undefined && (
            <span className="px-2 py-0.5 rounded-md text-fd-muted-foreground bg-fd-secondary font-medium whitespace-nowrap">
              default: <span className="text-fd-foreground">{String(defaultValue)}</span>
            </span>
          )}
        </div>
      </div>
      {children && (
        <div
          className="prose-sm text-fd-muted-foreground text-sm! [&_code]:text-xs! [&_code]:text-fd-muted-foreground"
          data-component-part="field-content"
        >
          {children}
        </div>
      )}
    </div>
  );
}
