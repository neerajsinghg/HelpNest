import { useState, useEffect } from 'react';
import PageHeader from '../components/Layout/PageHeader';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import adminService from '../services/adminService';
import '../pages/Dashboard.css';

const KYCApproval = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadKYCSubmissions();
    }, []);

    const loadKYCSubmissions = async () => {
        try {
            setLoading(true);
            const data = await adminService.getPendingKYC();
            setProfiles(data);
        } catch (err) {
            console.error('Error loading KYC submissions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (profileId) => {
        if (!window.confirm('Are you sure you want to approve this KYC submission?'))
            return;

        try {
            await adminService.approveKYC(profileId);
            alert('KYC approved successfully!');
            loadKYCSubmissions();
        } catch (err) {
            alert('Error approving KYC');
        }
    };

    const handleReject = async (profileId) => {
        const reason = window.prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            await adminService.rejectKYC(profileId, reason);
            alert('KYC rejected');
            loadKYCSubmissions();
        } catch (err) {
            alert('Error rejecting KYC');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <PageHeader
                title="KYC Approval"
                subtitle="Verify service provider documents"
            />

            <div className="data-table">
                <div className="table-header">
                    <h2>Pending KYC Submissions</h2>
                    <Button onClick={loadKYCSubmissions}>
                        <span className="material-icons" style={{ verticalAlign: 'middle', fontSize: '18px' }}>
                            refresh
                        </span> Refresh
                    </Button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Provider Name</th>
                            <th>Email</th>
                            <th>Documents</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                    No pending KYC submissions
                                </td>
                            </tr>
                        ) : (
                            profiles.map((profile) => (
                                <tr key={profile._id}>
                                    <td>{profile.user_id}</td>
                                    <td>N/A</td>
                                    <td>{profile.kyc_documents?.length || 0} documents</td>
                                    <td>
                                        <Badge status={profile.kyc_status} />
                                    </td>
                                    <td>
                                        <Button
                                            variant="success"
                                            onClick={() => handleApprove(profile._id)}
                                            style={{ marginRight: '8px' }}
                                        >
                                            Approve
                                        </Button>
                                        <Button variant="danger" onClick={() => handleReject(profile._id)}>
                                            Reject
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default KYCApproval;
