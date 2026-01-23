import { useState, useEffect } from 'react';
import PageHeader from '../components/Layout/PageHeader';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Modal from '../components/UI/Modal';
import adminService from '../services/adminService';
import '../pages/Dashboard.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '',
        is_active: true
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await adminService.getCategories();
            setCategories(data);
        } catch (err) {
            console.error('Error loading categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category?'))
            return;

        try {
            await adminService.deleteCategory(categoryId);
            alert('Category deleted successfully');
            loadCategories();
        } catch (err) {
            alert('Error deleting category');
        }
    };

    const handleCreate = () => {
        setEditingId(null);
        setFormData({
            name: '',
            description: '',
            icon: '',
            is_active: true
        });
        setShowModal(true);
    };

    const handleEdit = (category) => {
        setEditingId(category._id);
        setFormData({
            name: category.name,
            description: category.description || '',
            icon: category.icon || '',
            is_active: category.is_active
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await adminService.updateCategory(editingId, formData);
                alert('Category updated successfully');
            } else {
                await adminService.createCategory(formData);
                alert('Category created successfully');
            }
            setShowModal(false);
            loadCategories();
        } catch (err) {
            console.error(err);
            alert(`Error ${editingId ? 'updating' : 'creating'} category`);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <PageHeader title="Categories" subtitle="Manage service categories" />

            <div className="data-table">
                <div className="table-header">
                    <h2>All Categories</h2>
                    <Button variant="success" onClick={handleCreate}>
                        <span className="material-icons" style={{ verticalAlign: 'middle', fontSize: '18px' }}>
                            add
                        </span> Add Category
                    </Button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Icon</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat._id}>
                                <td style={{ fontSize: '24px' }}>{cat.icon || '📦'}</td>
                                <td>{cat.name}</td>
                                <td>{cat.description || 'N/A'}</td>
                                <td>
                                    <Badge status={cat.is_active ? 'active' : 'inactive'} />
                                </td>
                                <td>
                                    <Button
                                        variant="warning"
                                        onClick={() => handleEdit(cat)}
                                        style={{ marginRight: '8px' }}
                                    >
                                        Edit
                                    </Button>
                                    <Button variant="danger" onClick={() => handleDelete(cat._id)}>
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                title={editingId ? "Edit Category" : "Add New Category"}
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="e.g. Plumbing"
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        />
                    </div>
                    <div className="form-group">
                        <label>Icon (Emoji)</label>
                        <input
                            type="text"
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            placeholder="e.g. 🔧"
                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Category description..."
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', minHeight: '80px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                        <Button type="button" variant="danger" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="success">
                            Create Category
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Categories;
