import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProperties } from '../contexts/PropertyContext';
import './demopage.css';
import FavoriteToggle from '../components/FavoriteToggle';

const emptyForm = {
  title: '',
  type: 'Room',
  price: '',
  address: '',
  area: 'Lahore',
  bedrooms: 1,
  bathrooms: 1,
  parking: 0,
  status: 'Available',
  description: '',
  image: '',
};

function RoomsDemoPage() {
  const { properties, addProperty, updateProperty, deleteProperty } = useProperties();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const roomProperties = useMemo(() => properties.filter((p) => p.type === 'Room'), [properties]);

  const filteredProperties = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return roomProperties.filter((property) => {
      const matchesSearch =
        !term ||
        property.title?.toLowerCase().includes(term) ||
        property.address?.toLowerCase().includes(term) ||
        property.area?.toLowerCase().includes(term) ||
        property.description?.toLowerCase().includes(term);

      return matchesSearch;
    });
  }, [roomProperties, searchTerm]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.title || !form.address || !form.price) return;

    const payload = {
      ...form,
      type: 'Room',
      bedrooms: Number(form.bedrooms) || 1,
      bathrooms: Number(form.bathrooms) || 1,
      parking: Number(form.parking) || 0,
      image: form.image || '',
      images: form.image ? [form.image] : [],
      location: form.address,
      address: form.address,
      availability: form.status,
      description: form.description || 'Room listing managed through RMS.',
    };

    if (editingId) updateProperty(editingId, payload);
    else addProperty(payload);

    resetForm();
  };

  const handleEdit = (property) => {
    setEditingId(property.id);
    setForm({
      title: property.title || '',
      type: 'Room',
      price: property.price || '',
      address: property.address || property.location || '',
      area: property.area || 'Lahore',
      bedrooms: property.bedrooms ?? 1,
      bathrooms: property.bathrooms ?? 1,
      parking: property.parking ?? 0,
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
          <p className="eyebrow">Rooms Demo</p>
          <h1>Room-only property management</h1>
          <p className="subtitle">This view contains only room listings. Other categories are excluded.</p>
        </div>

        <div className="demo-search-panel">
          <input
            type="search"
            placeholder="Search rooms…"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </header>

      <section className="property-section">
        <div className="section-header">
          <div>
            <h2>Room management console</h2>
            <p>Create a new room listing or update an existing one instantly.</p>
          </div>
          <span className="section-count">{roomProperties.length} room records</span>
        </div>

        <div className="management-layout">
          <form className="management-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>
                Property title
                <input name="title" value={form.title} onChange={handleChange} placeholder="Cozy single room" required />
              </label>
              <label>
                Type
                <select name="type" value={form.type} onChange={handleChange}>
                  <option value="Room">Room</option>
                </select>
              </label>
            </div>

            <div className="form-row">
              <label>
                Price
                <input name="price" value={form.price} onChange={handleChange} placeholder="Rs 18,000 / month" required />
              </label>
              <label>
                Address
                <input name="address" value={form.address} onChange={handleChange} placeholder="Johar Town" required />
              </label>
            </div>

            <label>
              Image URL
              <input name="image" value={form.image} onChange={handleChange} placeholder="https://example.com/photo.jpg" />
            </label>

            <label>
              Description
              <textarea name="description" value={form.description} onChange={handleChange} rows="4" placeholder="Describe the room" />
            </label>

            <div className="form-actions">
              <button type="submit" className="details-button">{editingId ? 'Save changes' : 'Add room'}</button>
              <button type="button" className="secondary-button" onClick={resetForm}>Reset</button>
            </div>
          </form>

          <div className="management-preview">
            <h3>Live room listings</h3>
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
          <p>Room Portfolio Management</p>
          <h2>Keep your room listings organized and ready for renters.</h2>
        </div>
        <Link to="/demo/house" className="cta-button1">Open House View</Link>
      </section>
    </div>
  );
}

export default RoomsDemoPage;
