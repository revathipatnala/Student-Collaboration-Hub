import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import { LogOut } from 'lucide-react';

const MainHeader: React.FC<{ title?: string }> = ({ title }) => {
	const navigate = useNavigate();
	const { user } = useAuth();
	return (
		<header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 w-full z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center">
						<div className="items-center justify-center mr-3">
							<svg
								width="79"
								height="32"
								viewBox="0 0 79 32"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M20.1424 0.843087L16.9853 0L14.3248 9.89565L11.9228 0.961791L8.76555 1.80488L11.3608 11.4573L4.8967 5.01518L2.58549 7.31854L9.67576 14.3848L0.845959 12.0269L0 15.1733L9.64767 17.7496C9.53721 17.2748 9.47877 16.7801 9.47877 16.2717C9.47877 12.6737 12.4055 9.75685 16.0159 9.75685C19.6262 9.75685 22.5529 12.6737 22.5529 16.2717C22.5529 16.7768 22.4952 17.2685 22.3861 17.7405L31.1541 20.0818L32 16.9354L22.314 14.3489L31.1444 11.9908L30.2984 8.84437L20.6128 11.4308L27.0768 4.98873L24.7656 2.68538L17.7737 9.65357L20.1424 0.843087Z" fill="#367AFF" />
								<path d="M22.3776 17.7771C22.1069 18.9176 21.5354 19.9421 20.7513 20.763L27.1033 27.0935L29.4145 24.7901L22.3776 17.7771Z" fill="#367AFF" />
								<path d="M20.6872 20.8292C19.8936 21.637 18.8907 22.2398 17.7661 22.5504L20.0775 31.1472L23.2346 30.3041L20.6872 20.8292Z" fill="#367AFF" />
								<path d="M17.6482 22.5819C17.1264 22.7156 16.5795 22.7866 16.0159 22.7866C15.4121 22.7866 14.8274 22.705 14.2723 22.5523L11.9589 31.1569L15.116 32L17.6482 22.5819Z" fill="#367AFF" />
								<path d="M14.1607 22.5205C13.0532 22.1945 12.0682 21.584 11.2908 20.7739L4.92322 27.1199L7.23442 29.4233L14.1607 22.5205Z" fill="#367AFF" />
								<path d="M11.2377 20.7178C10.4737 19.9026 9.91718 18.8917 9.65228 17.7688L0.855713 20.1179L1.70167 23.2643L11.2377 20.7178Z" fill="#367AFF" />
							</svg>
						</div>
						<h1 className="text-xl font-bold text-gray-900 ml-2">Student Hub</h1>
						<div className="flex gap-2 mx-8">
							<Button variant="outline" size="sm" onClick={() => navigate('/Dashboard')}>Home</Button>
							<Button variant="outline" size="sm" onClick={() => navigate('/Events')}>Events</Button>
							<Button variant="outline" size="sm" onClick={() => navigate('/Clubs')}>Clubs</Button>
							<Button variant="outline" size="sm" onClick={() => navigate('/Lostandfound')}>Lost &amp; Found</Button>
							<Button variant="outline" size="sm" onClick={() => navigate('/Sellbuy')}>Sell &amp; Buy</Button>
							<Button variant="outline" size="sm" onClick={() => navigate('/Posts')}>Posts</Button>
						</div>
					</div>
					<div className="flex items-center space-x-4">
						<div className="hidden sm:block text-right">
							<p className="text-sm font-medium text-gray-900">Welcome, {user?.fullName}!</p>
							<p className="text-xs text-gray-500">{user?.email}</p>
						</div>
						<Button
							variant="outline"
							className="flex items-center space-x-2"
							onClick={() => {
								if (window.confirm('Are you sure you want to logout?')) {
									localStorage.clear();
									navigate('/signin');
								}
							}}
						>
							<LogOut className="w-4 h-4" />
							<span>Sign Out</span>
						</Button>
					</div>
				</div>
			</div>
		</header>
	);
};

export default MainHeader;
