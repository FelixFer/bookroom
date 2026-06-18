type Props = {
  emoji: string;
  children: React.ReactNode;
  action?: React.ReactNode;
};

export const EmptyState = ({ emoji, children, action }: Props) => (
  <div className="flex flex-col items-center gap-4 pt-8 text-center">
    <span className="text-4xl" aria-hidden="true">{emoji}</span>
    <p className="form-help">{children}</p>
    {action}
  </div>
)
