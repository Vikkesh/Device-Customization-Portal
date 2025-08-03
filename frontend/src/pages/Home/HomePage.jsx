import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import styles from './HomePage.module.css';
import SearchComponent from '../../components/SearchComponent/SearchComponent';
import axios from 'axios';

const HomePage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);

  useEffect(() =>{
    if (!localStorage.getItem('token')) {
    return <Navigate to="/login" />;
  }
  }, []);
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };
    fetchProjects();
  }, []);

  const isAdmin = user?.role === 'admin';

  const handleSearchResults = useCallback((results) => {
    setFilteredProjects(results);
  }, []);

  const handleCreateProject = () => {
    navigate('/createproject');
  };

  const handleDeleteProjects = async () => {
    if (selectedProjects.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedProjects.length} project(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete('http://localhost:8080/api/projects/bulk-delete', {
        data: { projectIds: selectedProjects }
      });
      
      // Refresh the projects list
      const response = await axios.get('http://localhost:8080/api/projects');
      setProjects(response.data);
      setSelectedProjects([]);
      alert('Projects deleted successfully!');
    } catch (error) {
      console.error('Failed to delete projects:', error);
      alert(error.response?.data?.error || 'Failed to delete projects. Please try again.');
    }
  };

    const handleChangeStatus = async (newStatus) => {
    if (selectedProjects.length === 0) return;

    try {
      const response = await axios.put('http://localhost:8080/api/projects/change-status', {
        projectIds: selectedProjects,
        status: newStatus
      });

      if (response.data.success) {
        // Update local state
        setProjects(projects.map(project => 
          selectedProjects.includes(project.project_id) 
            ? { ...project, project_status: newStatus }
            : project
        ));
        
        // Clear selection
        setSelectedProjects([]);
        
        alert(`Successfully changed status to ${newStatus} for ${selectedProjects.length} project(s)`);
      }
    } catch (error) {
      console.error('Error changing status:', error);
      alert('Failed to change project status. Please try again.');
    }
  };

  const handleProjectSelection = (projectId, isChecked) => {
    if (isChecked) {
      setSelectedProjects(prev => [...prev, projectId]);
    } else {
      setSelectedProjects(prev => prev.filter(id => id !== projectId));
    }
  };
  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      filteredProjects.length > 0
        ? setSelectedProjects(filteredProjects.map(project => project.project_id))
        : setSelectedProjects(projects.map(project => project.project_id));
    } else {
      setSelectedProjects([]);
    }
  };

  return (
    <div className={styles.homePage}>
      <div className={styles.pageContent}>
        <p>Welcome, {user?.username || 'User'}! This is your project dashboard.</p>
        <div className={styles.projectManagementSection}>
        <div className={styles.searchContainer}>
          <SearchComponent 
            onSearchResults={handleSearchResults}
            data={projects}
            searchFields={['project_status', 'customer_name', 'shipping_country']}
            placeholder="Search projects by status, customer, or country..."
          />
        </div>
        <div className={styles.controlsContainer}>
          <div className={styles.regularButtons}>
          <button onClick={handleCreateProject} className={`${styles.createProjectButton} ${styles.button}`}>
            Create Project
          </button>
           <button 
                   className={`${styles.button} ${styles.deleteButton}`}  
                   onClick={handleDeleteProjects}
                   disabled={selectedProjects.length === 0}>
                        
                    Delete Project{selectedProjects.length > 1 ? 's' : ''}
                   </button>
          </div> 
           {isAdmin && (
          <div className = {styles.adminButtons}>
            <span>Set status: </span>
           <button className = {`${styles.button} ${styles.statusButton}`} 
                onClick={() => handleChangeStatus('Active')}
                disabled={selectedProjects.length === 0}>
            Active
            </button>
            <button className = {`${styles.button} ${styles.statusButton}`} 
                onClick={() => handleChangeStatus('Suspend')}
                disabled={selectedProjects.length === 0}>
            Suspend
            </button>
            <button className = {`${styles.button} ${styles.statusButton}`} 
                onClick={() => handleChangeStatus('Completed')}
                disabled={selectedProjects.length === 0}>
            Completed
            </button>
          </div>
          )}
        </div>
      <div className={styles.tableContainer}>
        <table className={styles.projectsTable}>
          <thead>
            <tr>
              <th>Project ID</th>
              <th>Customer Name</th>
              <th>Shipping Country</th>
              <th># of active projects</th>
              <th># of total projects</th>
              <th>Device Model</th>
              <th>Device Amount</th>
              <th>Created by</th>
              <th>Status</th>
              <th>Description</th>
              <th>
               <span className={styles.selectHeader}>
                 Select
                <input 
                type="checkbox" 
                className={styles.selectAllCheckbox}
                onChange={(e) => handleSelectAll(e.target.checked)}
                checked={filteredProjects.length > 0 ? filteredProjects.length === selectedProjects.length : selectedProjects.length === projects.length && projects.length > 0}
                />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {(filteredProjects.length > 0 ? filteredProjects : projects).length === 0? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>No projects to display yet.</td>
              </tr>
            ) : (
              (filteredProjects.length>0?filteredProjects : projects).map((project) => (
                <tr key={project.project_id}>
                  <td><Link to={`/project/${project.project_id}`}>{project.project_id}</Link></td>
                  <td>{project.customer_name}</td>
                  <td>{project.shipping_country}</td>
                  <td>{project.num_active_projects}</td>
                  <td>{project.num_total_projects}</td>
                  <td> {project.device_id ? (
                        <Link to={`/device-information/${project.device_id}`}>
                          {project.device_model}
                        </Link>
                      ) : (project.device_model)}</td>
                  <td>{project.device_amount}</td>
                  <td>{project.created_by}</td>
                  <td>{project.project_status}</td>
                  <td>{project.project_description}</td>
                  <td> <input 
                        type="checkbox" 
                        checked={selectedProjects.includes(project.project_id)}
                        onChange={(e) => handleProjectSelection(project.project_id, e.target.checked)}
                      />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
       </div> 
        </div>
      </div>
    </div>
  );
};

export default HomePage;
