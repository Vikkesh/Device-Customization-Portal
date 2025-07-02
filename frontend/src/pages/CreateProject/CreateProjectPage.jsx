import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './CreateProjectPage.module.css';

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [form, setForm] = useState({
    customerName: '',
    shippingCountry: '',
    shippingDeviceAmount: '',
    validDays: '',
    deviceModel: '',
    projectDescription: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/projects', {
        customer_name: form.customerName,
        shipping_country: form.shippingCountry,
        device_amount: form.shippingDeviceAmount,
        device_model: form.deviceModel,
        project_description: form.projectDescription,
        created_by: user?.id,
      });
      if (response.status === 201) {
        const newProjectId = response.data.id;
        navigate(`/project/${newProjectId}`);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    }
  };

  return (
    <div className={styles.createProjectPage}>
      <h2>Create Project</h2>
      <form className={styles.createProjectForm} onSubmit={handleSubmit}>
        <label>Customer Name
          <input name="customerName" value={form.customerName} onChange={handleChange} required />
        </label>
        <label>Shipping Country
          <select name="shippingCountry" value={form.shippingCountry} onChange={handleChange} required>
            <option value="">Select a country</option>
            <option value="USA">United States</option>
            <option value="Canada">Canada</option>
            <option value="India">India</option>
          </select>
        </label>
        <label>Shipping device amount
          <input name="shippingDeviceAmount" type="number" value={form.shippingDeviceAmount} onChange={handleChange} required />
        </label>
        <label>Valid Days
          <input name="validDays" type="number" value={form.validDays} onChange={handleChange}  />
        </label>
        <label>Device Model
          <select name="deviceModel" value={form.deviceModel} onChange={handleChange} required>
            <option value="">Select a model</option>
            <option value="Model X">Model X</option>
            <option value="Model Y">Model Y</option>
            <option value="Model Z">Model Z</option>
          </select>
        </label>
        <label>Description
          <textarea name="projectDescription" value={form.projectDescription} onChange={handleChange} required />
        </label>
        <button type="submit" className={styles.createProjectButton}>Create Project</button>
      </form>
    </div>
  );
};

export default CreateProjectPage;
