
type CardProps = {
  title: string;
  description: string;
  href?: string;
};

export default function Card({ title, description, href = '#' }: CardProps) {
  return (
    <a href={href} className="bg-neutral-primary block max-w-sm p-6 border border-default rounded-md shadow-xs hover:bg-neutral-secondary-medium">
      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{title}</h5>
      <p className="mb-3 font-normal text-gray-700">{description}</p>
    </a>
  );
}