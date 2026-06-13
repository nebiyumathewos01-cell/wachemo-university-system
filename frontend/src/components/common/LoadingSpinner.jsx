const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-primary-600 ${sizes[size]}`} />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
};

export const FullPageLoader = ({ text = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

export default LoadingSpinner;
