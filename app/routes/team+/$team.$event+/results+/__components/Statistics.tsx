export type Statistics = { total: number; notPublished: number; published: number };

export function Statistics({ total, notPublished, published }: Statistics) {
  return (
    <dl className="flex justify-evenly text-center my-4">
      <div className="overflow-hidden">
        <dt className="truncate text-sm font-medium text-gray-500">Already published</dt>
        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{published}</dd>
      </div>
      <div className="overflow-hidden">
        <dt className="truncate text-sm font-medium text-gray-500">To publish</dt>
        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{notPublished}</dd>
      </div>
    </dl>
  );
}
