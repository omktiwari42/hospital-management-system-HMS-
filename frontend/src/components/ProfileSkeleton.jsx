import "./ProfileSkeleton.css";

function ProfileSkeleton() {
    return (
        <div className="page">

            <div className="page-header skeleton-header">
                <div className="skeleton skeleton-btn"></div>
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-edit"></div>
            </div>

            <div className="profile-card">

                <div className="profile-avatar-section">

                    <div className="skeleton skeleton-avatar"></div>

                    <div className="skeleton skeleton-role"></div>

                    <div className="skeleton skeleton-small"></div>

                    <div className="skeleton skeleton-small"></div>

                </div>

                <div className="profile-details">

                    <div className="profile-grid">

                        {Array.from({ length: 9 }).map((_, index) => (
                            <div className="profile-item" key={index}>
                                <div className="skeleton skeleton-label"></div>
                                <div className="skeleton skeleton-text"></div>
                            </div>
                        ))}

                    </div>

                    <div className="profile-section">

                        <div className="skeleton skeleton-section-title"></div>

                        <div className="skeleton skeleton-box"></div>

                    </div>

                    <div className="profile-section">

                        <div className="skeleton skeleton-section-title"></div>

                        <div className="skeleton skeleton-box large"></div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default ProfileSkeleton;