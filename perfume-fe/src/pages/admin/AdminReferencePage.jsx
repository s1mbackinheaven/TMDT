import { useState } from 'react'
import ReferenceCrudPage from './reference/ReferenceCrudPage'

const TABS = [
  { key: 'brands', label: 'Brands' },
  { key: 'categories', label: 'Categories' },
  { key: 'collections', label: 'Collections' },
  { key: 'scent-families', label: 'Scent families' },
  { key: 'tags', label: 'Tags' },
]

const AdminReferencePage = () => {
  const [tab, setTab] = useState('brands')

  return (
    <div>
      <h1 className="text-2xl font-semibold text-black">Reference Data</h1>
      <p className="mt-2 text-sm text-black/60">
        CRUD cho brands, categories, collections, scent-families, tags.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`px-4 py-2 text-sm font-semibold rounded-full cursor-pointer transition-colors ${
              tab === t.key
                ? 'bg-black text-white'
                : 'bg-white text-black border border-black/10 hover:bg-black/5'
            }`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <ReferenceCrudPage entityKey={tab} />
      </div>
    </div>
  )
}

export default AdminReferencePage

