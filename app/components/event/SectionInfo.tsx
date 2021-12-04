import React from 'react'
import cn from 'classnames';
import { CfpState, formatCFPDate, formatCFPState } from '../../utils/event';
import { SectionPanel } from '../ui/Panels';

type SectionInfoProps = {
  description: string | null;
  cfpState: CfpState;
  cfpStart?: string;
  cfpEnd?: string;
  formats: Array<{ id: string; name: string; description: string | null }>;
  categories: Array<{ id: string; name: string; description: string | null }>;
  className?: string;
};

export function SectionInfo({
  description,
  cfpState,
  cfpStart,
  cfpEnd,
  formats,
  categories,
  className,
}: SectionInfoProps) {
  return (
    <SectionPanel
      id="event-information"
      title="Event information"
      className={cn('grid gap-x-4 gap-y-8', className)}
      padding
    >
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">{formatCFPState(cfpState)}</h3>
        {!!cfpStart && <p className="mt-1 text-sm text-gray-500">{formatCFPDate(cfpState, cfpStart, cfpEnd)}</p>}
      </div>
      <div>
        <p className="text-sm text-gray-900">{description}</p>
      </div>
      {formats.length > 0 ? (
        <div>
          <h3 className="text-base leading-6 font-medium text-gray-900">Formats</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Talks formats proposed by the conference.</p>
          <div className="mt-4 text-sm text-gray-900">
            <dl className="border border-gray-200 rounded-md divide-y divide-gray-200">
              {formats.map((f) => (
                <div key={f.name} className="pl-3 pr-4 py-3 text-sm">
                  <dt className="text-sm font-medium text-gray-500">{f.name} </dt>
                  <dd className="mt-1 text-sm text-gray-900 line-clamp-2">{f.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ) : null}
      {categories.length > 0 ? (
        <div>
          <h3 className="text-base leading-6 font-medium text-gray-900">Categories</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Different categories and tracks proposed by the conference.
          </p>
          <div className="mt-4 text-sm text-gray-900">
            <dl role="list" className="border border-gray-200 rounded-md divide-y divide-gray-200">
              {categories.map((c) => (
                <div key={c.name} className="pl-3 pr-4 py-3 text-sm">
                  <dt className="text-sm font-medium text-gray-500">{c.name} </dt>
                  <dd className="mt-1 text-sm text-gray-900 line-clamp-2">{c.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ) : null}
    </SectionPanel>
  );
}
