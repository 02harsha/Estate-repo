import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent';
  href?: string;
  description?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  variant = 'default',
  href,
  description
}: StatsCardProps) {
  const cardClasses = cn(
    variant === 'primary' && 'stat-card-primary',
    variant === 'accent' && 'stat-card-accent',
    variant === 'default' && 'stat-card',
    href && 'cursor-pointer'
  );

  const content = (
    <>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={cn(
            "text-sm font-medium",
            variant === 'default' ? 'text-muted-foreground' : 'text-white/80'
          )}>
            {title}
          </p>
          <p className={cn(
            "text-3xl font-bold tracking-tight animate-count-up",
            variant === 'default' ? 'text-foreground' : 'text-white'
          )}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className={cn(
              "text-xs mt-1",
              variant === 'default' ? 'text-muted-foreground' : 'text-white/60'
            )}>
              {description}
            </p>
          )}
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          variant === 'default' ? 'bg-muted' : 'bg-white/20'
        )}>
          <Icon className={cn(
            "h-6 w-6",
            variant === 'default' ? 'text-primary' : 'text-white'
          )} />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span className={cn(
            "flex items-center gap-1 text-sm font-medium",
            trend.isPositive 
              ? (variant === 'default' ? 'text-success' : 'text-white') 
              : (variant === 'default' ? 'text-destructive' : 'text-white/80')
          )}>
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {trend.value}%
          </span>
          <span className={cn(
            "text-sm",
            variant === 'default' ? 'text-muted-foreground' : 'text-white/60'
          )}>
            vs last week
          </span>
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link to={href} className={cardClasses}>
        {content}
      </Link>
    );
  }

  return <div className={cardClasses}>{content}</div>;
}