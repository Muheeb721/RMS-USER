import React, { useState } from 'react';
import { Select, Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import './home-redesign.css';

export default function PropertySearch() {
  const [transaction, setTransaction] = useState('All');
  const [type, setType] = useState('All');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const navigate = useNavigate();

  const doSearch = () => {
    const params = new URLSearchParams();
    if (transaction && transaction !== 'All') params.set('transaction', transaction);
    if (type && type !== 'All') params.set('type', type);
    if (location) params.set('area', location);
    if (budget) params.set('budget', budget);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="hr-search-card">
      <h4 className="search-title">Find a Property</h4>
      <div className="search-row">
        <Select value={transaction} onChange={setTransaction} style={{ minWidth: 140 }}>
          <Select.Option value="All">I Want To</Select.Option>
          <Select.Option value="Sale">Buy</Select.Option>
          <Select.Option value="Rent">Rent</Select.Option>
        </Select>

        <Select value={type} onChange={setType} style={{ minWidth: 160 }}>
          <Select.Option value="All">Property Type</Select.Option>
          <Select.Option value="House">House</Select.Option>
          <Select.Option value="Apartment">Apartment</Select.Option>
          <Select.Option value="Flat">Flat</Select.Option>
          <Select.Option value="Room">Room</Select.Option>
        </Select>

        <Input placeholder="Location" value={location} onChange={(e)=>setLocation(e.target.value)} style={{ minWidth: 160 }} />

        <Input placeholder="Budget" value={budget} onChange={(e)=>setBudget(e.target.value)} style={{ minWidth: 140 }} />

        <Button type="primary" onClick={doSearch}>Search Properties</Button>
      </div>
    </div>
  );
}
