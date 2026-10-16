import { useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Plus,
  Heart,
  Package,
  Shield,
  CheckCircle,
  Save
} from "lucide-react";
import { toast } from "react-toastify";

const Profile = () => {
  const { user, login, token, isAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [address, setAddress] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // New Address modal/form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newLabel, setNewLabel] = useState("Home");
  const [newStreet, setNewStreet] = useState("");
  const [newCity, setNewCity] = useState("Pune");
  const [newPincode, setNewPincode] = useState("411001");
  const [newLandmark, setNewLandmark] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await API.get("/customer/profile");
      if (res.data?.data) {
        const cust = res.data.data;
        setProfile(cust);
        setName(cust.name || "");
        setMobileNo(cust.mobileNo || "");
        setAddress(cust.address || "");
      }
    } catch (err) {
      console.error("Profile load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await API.put("/customer/profile", {
        name: name.trim(),
        mobileNo: mobileNo.trim(),
        address: address.trim()
      });

      if (res.data?.data) {
        setProfile(res.data.data);
        login(token, {
          ...user,
          name: res.data.data.name,
          mobileNo: res.data.data.mobileNo,
          address: res.data.data.address
        });
        toast.success("Profile updated successfully! ✨");
      }
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newStreet.trim() || !newPincode.trim()) {
      toast.warning("Street and pincode are required");
      return;
    }

    try {
      const res = await API.post("/customer/address", {
        label: newLabel,
        street: newStreet.trim(),
        city: newCity.trim(),
        pincode: newPincode.trim(),
        landmark: newLandmark.trim(),
        isDefault: profile?.savedAddresses?.length === 0
      });

      if (res.data?.data) {
        setProfile((prev) => ({ ...prev, savedAddresses: res.data.data }));
        setShowAddressForm(false);
        setNewStreet("");
        setNewLandmark("");
        toast.success("New address saved! 📍");
      }
    } catch (err) {
      toast.error("Failed to add address");
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      const res = await API.delete(`/customer/address/${addrId}`);
      if (res.data?.data) {
        setProfile((prev) => ({ ...prev, savedAddresses: res.data.data }));
        toast.info("Address deleted");
      }
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5 min-vh-100 d-flex flex-column align-items-center justify-content-center">
        <div className="spinner-border text-warning" role="status"></div>
      </div>
    );
  }

  return (
    <div className="profile-page min-vh-100 d-flex flex-column" style={{ background: "var(--bg-page)" }}>
      {/* Header */}
      <div className="bg-white border-bottom py-4 shadow-sm mb-4">
        <div className="container">
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary) 0%, var(--accent-amber) 100%)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                fontWeight: 700
              }}
            >
              {(name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="fw-bold mb-0">{name || "Valued Customer"}</h3>
              <span className="text-muted small">{user?.email}</span>
              {isAdmin && (
                <span className="badge bg-warning text-dark ms-2 small">
                  👑 ADMIN
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container flex-grow-1 pb-5">
        <div className="row g-4">
          {/* Left Column: Personal Information Editor */}
          <div className="col-lg-6">
            <div className="chai-card p-4">
              <h5 className="fw-bold mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
                <User size={20} className="text-warning" /> Personal Details
              </h5>

              <form onSubmit={handleUpdateProfile}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Email Address</label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    value={user?.email || ""}
                    disabled
                  />
                  <span className="form-text text-muted small">Registered login email cannot be modified.</span>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Primary Mobile Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="9876543210"
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Default Home Address</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-chai-primary px-4 py-2"
                  disabled={savingProfile}
                >
                  <Save size={16} /> Save Changes
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Saved Delivery Addresses */}
          <div className="col-lg-6">
            <div className="chai-card p-4">
              <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <MapPin size={20} className="text-warning" /> Saved Delivery Addresses
                </h5>

                <button
                  className="btn btn-sm btn-chai-outline d-flex align-items-center gap-1 rounded-pill"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                >
                  <Plus size={14} /> Add Address
                </button>
              </div>

              {/* Add Address Form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="p-3 bg-light rounded-4 border mb-4">
                  <h6 className="fw-bold mb-3 small">Add New Delivery Location</h6>
                  <div className="row g-2">
                    <div className="col-6">
                      <select
                        className="form-select form-select-sm"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                      >
                        <option value="Home">Home 🏠</option>
                        <option value="Work">Work / Office 🏢</option>
                        <option value="Other">Other 📍</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Pincode (e.g. 411001)"
                        value={newPincode}
                        onChange={(e) => setNewPincode(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Flat / Building / Street Address *"
                        value={newStreet}
                        onChange={(e) => setNewStreet(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="City"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Landmark"
                        value={newLandmark}
                        onChange={(e) => setNewLandmark(e.target.value)}
                      />
                    </div>

                    <div className="col-12 d-flex gap-2 mt-2">
                      <button type="submit" className="btn btn-sm btn-chai-primary flex-fill">
                        Save Address
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setShowAddressForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Saved Addresses List */}
              <div className="d-flex flex-column gap-3">
                {profile?.savedAddresses && profile.savedAddresses.length > 0 ? (
                  profile.savedAddresses.map((addr) => (
                    <div
                      key={addr._id}
                      className="p-3 border rounded-3 bg-light d-flex align-items-center justify-content-between"
                    >
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-secondary text-white small">
                            {addr.label || "Home"}
                          </span>
                          {addr.isDefault && (
                            <span className="badge bg-success bg-opacity-15 text-success small">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="small mb-0 mt-1 fw-semibold">{addr.street}</p>
                        <span className="text-muted small">
                          {addr.city} - {addr.pincode} {addr.landmark ? `(${addr.landmark})` : ""}
                        </span>
                      </div>

                      <button
                        className="btn btn-sm text-danger p-1"
                        onClick={() => handleDeleteAddress(addr._id)}
                        title="Delete Address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted small py-3 text-center mb-0">
                    No saved addresses yet. Add one for 1-click checkout!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
