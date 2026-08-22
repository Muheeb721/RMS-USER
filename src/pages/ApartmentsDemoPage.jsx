import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProperties } from '../contexts/PropertyContext';
import './demopage.css';
import FavoriteToggle from '../components/FavoriteToggle';

const emptyForm = {
  title: '',
  type: 'Apartment',
  price: '',
  address: '',
  area: 'Lahore',
  bedrooms: 2,
  bathrooms: 2,
  parking: 1,
  status: 'Available',
  description: '',
  image: '',
};

function ApartmentsDemoPage() {
  const { properties, addProperty, updateProperty, deleteProperty } = useProperties();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const aptProperties = useMemo(() => properties.filter((p) => p.type === 'Apartment'), [properties]);

  const filteredProperties = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return aptProperties.filter((property) => {
      const matchesSearch =
        !term ||
        property.title?.toLowerCase().includes(term) ||
        property.address?.toLowerCase().includes(term) ||
        property.area?.toLowerCase().includes(term) ||
        property.description?.toLowerCase().includes(term);

      return matchesSearch;
    });
  }, [aptProperties, searchTerm]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.title || !form.address || !form.price) return;

    const payload = {
      ...form,
      type: 'Apartment',
      bedrooms: Number(form.bedrooms) || 2,
      bathrooms: Number(form.bathrooms) || 2,
      parking: Number(form.parking) || 1,
      image: form.image || '',
      images: form.image ? [form.image] : [],
      location: form.address,
      address: form.address,
      availability: form.status,
      description: form.description || 'Apartment listing managed through RMS.',
    };

    if (editingId) updateProperty(editingId, payload);
    else addProperty(payload);

    resetForm();
  };

  const handleEdit = (property) => {
    setEditingId(property.id);
    setForm({
      title: property.title || '',
      type: 'Apartment',
      price: property.price || '',
      address: property.address || property.location || '',
      area: property.area || 'Lahore',
      bedrooms: property.bedrooms ?? 2,
      bathrooms: property.bathrooms ?? 2,
      parking: property.parking ?? 1,
      status: property.status || 'Available',
      description: property.description || '',
      image: property.image || '',
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = (id) => {
    deleteProperty(id);
    if (editingId === id) resetForm();
  };

  return (
    <div className="demo-page">
      <header className="demo-header">
        <div className="demo-heading">
          <p className="eyebrow">Apartments Demo</p>
          <h1>Apartment-only property management</h1>
          <p className="subtitle">This view contains only apartment listings. Other categories are excluded.</p>
        </div>

        <div className="demo-search-panel">
          <input
            type="search"
            placeholder="Search apartments…"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </header>

      <section className="property-section">
        <div className="section-header">
          <div>
            <h2>Apartment management console</h2>
            <p>Create a new apartment listing or update an existing one instantly.</p>
          </div>
          <span className="section-count">{aptProperties.length} apartment records</span>
        </div>

        <div className="management-layout">
          <form className="management-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>
                Property title
                <input name="title" value={form.title} onChange={handleChange} placeholder="Modern apartment" required />
              </label>
              <label>
                Type
                <select name="type" value={form.type} onChange={handleChange}>
                  <option value="Apartment">Apartment</option>
                  <option value="Flat">Flat</option>
                </select>
              </label>
            </div>

            <div className="form-row">
              <label>
                Price
                <input name="price" value={form.price} onChange={handleChange} placeholder="Rs 62 Lakh" required />
              </label>
              <label>
                Address
                <input name="address" value={form.address} onChange={handleChange} placeholder="Bahria Town" required />
              </label>
            </div>

            <label>
              Image URL
              <input name="image" value={form.image} onChange={handleChange} placeholder="https://example.com/photo.jpg" />
            </label>

            <label>
              Description
              <textarea name="description" value={form.description} onChange={handleChange} rows="4" placeholder="Describe the apartment" />
            </label>

            <div className="form-actions">
              <button type="submit" className="details-button">{editingId ? 'Save changes' : 'Add apartment'}</button>
              <button type="button" className="secondary-button" onClick={resetForm}>Reset</button>
            </div>
          </form>

          <div className="management-preview">
            <h3>Live apartment listings</h3>
            {filteredProperties.map((property) => (
              <article className="property-card compact" key={property.id}>
                <div className="card-image" style={{ backgroundImage: `url(${property.image})` }} />
                <div className="card-body">
                  <div className="card-meta">
                    <span className="card-type">{property.type}</span>
                    <span className={property.status === 'Available' ? 'status-badge available' : 'status-badge occupied'}>{property.status}</span>
                  </div>
                  <h3>{property.title}</h3>
                  <p className="location">📍 {property.address || property.location}</p>
                  <div className="card-footer">
                    <p className="price">{property.price}</p>
                    <div className="card-actions">
                      <button type="button" className="secondary-button" onClick={() => handleEdit(property)}>Edit</button>
                      <button type="button" className="details-button" onClick={() => handleDelete(property.id)}>Delete</button>
                    </div>
                    <FavoriteToggle item={property} label="Save" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="demo-cta">
        <div>
          <p>Apartment Portfolio Management</p>
          <h2>Keep your apartment listings organized and ready for buyers and tenants.</h2>
        </div>
        <Link to="/demo/house" className="cta-button1">Open House View</Link>
      </section>
    </div>
  );
}

export default ApartmentsDemoPage;
