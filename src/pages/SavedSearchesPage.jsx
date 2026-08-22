import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Card, Button } from 'antd';
import { read as readSavedSearches, remove as removeSavedSearch } from '../utils/savedSearchesStorage';

function SavedSearchesPage() {
  const navigate = useNavigate();
  const saved = useMemo(() => readSavedSearches(), []);

  const run = (filters) => {
    const params = new URLSearchParams();
    if (!filters) return navigate('/properties');
    if (filters.q) params.set('q', filters.q);
    if (filters.type && filters.type !== 'Any Type') params.set('type', filters.type);
    if (filters.area && filters.area !== 'All Areas') params.set('area', filters.area);
    navigate(`/properties?${params.toString()}`);
  };

  const del = (id) => {
    removeSavedSearch(id);
    window.dispatchEvent(new Event('rms-saved-searches-updated'));
  };

  return (
    <div className="page-shell">
      <section className="section-card">
        <h2 className="section-title">Saved Searches</h2>
        <p className="section-subtitle">View, run, or delete your saved searches.</p>
        <List dataSource={saved} renderItem={(item) => (
          <List.Item actions={[<Button key="run" onClick={() => run(item.filters)}>Run</Button>, <Button key="delete" danger onClick={() => del(item.id)}>Delete</Button>] }>
            <List.Item.Meta title={item.name} description={JSON.stringify(item.filters)} />
          </List.Item>
        )} />
      </section>
    </div>
  );
}

export default SavedSearchesPage;
