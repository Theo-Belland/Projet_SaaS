import { useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BsArrowLeftShort, BsSearch, BsChevronDown, BsFillImageFill, BsReverseLayoutTextSidebarReverse, BsPerson } from 'react-icons/bs';
import { AiFillEnvironment, AiOutlineBarChart, AiOutlineFileText, AiOutlineMail, AiOutlineSetting, AiOutlineLogout, AiOutlineTool } from 'react-icons/ai';
import { RiDashboardFill } from 'react-icons/ri';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const Menus: Array<{
    title: string;
    icon: ReactNode;
    path?: string;
    spacing?: boolean;
    submenu?: boolean;
    submenuItems?: { title: string; path?: string }[];
  }> = [
    { title: 'Dashboard', icon: <RiDashboardFill />, path: '/dashboard' },
    { title: 'Sites', icon: <AiFillEnvironment />, path: '/sites' },
    { title: 'Projets', icon: <BsReverseLayoutTextSidebarReverse />, path: '/projects' },
    { title: 'Compétences', icon: <AiOutlineTool />, path: '/skills' },
    { title: 'Analytics', icon: <AiOutlineBarChart />, path: '/analytics' },
    {
      title: 'Pages',
      icon: <AiOutlineFileText />,
      submenu: true,
      submenuItems: [{ title: 'Contact', path: '/contact' }],
    },
    { title: 'Media', spacing: true, icon: <BsFillImageFill /> },
    { title: 'Inbox', icon: <AiOutlineMail />, path: '/inbox' },
    { title: 'Profile', spacing: true, icon: <BsPerson /> },
    { title: 'Setting', icon: <AiOutlineSetting /> },
    { title: 'Logout', icon: <AiOutlineLogout /> },
  ];

  return (
    <div className="flex">
      <div className={`bg-dark-purple min-h-screen p-5 pt-8 ${isOpen ? 'w-72' : 'w-20'} duration-300 relative`}>
        <BsArrowLeftShort className={`bg-white text-dark-purple text-3xl rounded-full absolute -right-3 top-9 border border-dark-purple cursor-pointer ${!isOpen && 'rotate-180'}`} onClick={() => setIsOpen(!isOpen)} />
        <div className="inline-flex">
          <AiFillEnvironment className={`bg-amber-300 text-4xl rounded cursor-pointer block float-left mr-2 duration-500 ${isOpen && 'rotate-[360deg]'}`} />
          <h1 className={`text-white origin-left font-medium text-xl duration-300 ${!isOpen && 'scale-0'}`}>Sidebar</h1>
        </div>
        <div className={`flex items-center rounded-md bg-light-white mt-6 ${!isOpen ? "px-2.5" : "px-4"} py-2`}>
          <BsSearch className={`text-white text-lg cursor-pointer mr-2 ${!isOpen && "mr-2"}`} />
          <input type={"search"} placeholder="Search" className={`text-base bg-transparent w-full text-white focus:outline-none ${!isOpen && "hidden"}`} />
        </div>
        <ul className="pt-2">
          {Menus.map((Menu, index) => (
            <li key={index} className={`text-gray-300 text-sm flex flex-col gap-y-2 rounded-md ${Menu.spacing ? 'mt-9' : 'mt-2'}`}>
              {Menu.path ? (
                <NavLink
                  to={Menu.path}
                  className={({ isActive }) =>
                    `flex items-center gap-x-4 p-2 rounded-md transition ${
                      isActive ? 'bg-white text-dark-purple' : 'text-gray-300 hover:bg-light-white'
                    }`
                  }
                >
                  <span className="text-2xl block float-left">{Menu.icon}</span>
                  <span className={`text-base font-medium flex-1 duration-200 ${!isOpen && 'hidden'}`}>{Menu.title}</span>
                </NavLink>
              ) : Menu.title === 'Logout' ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-x-4 p-2 rounded-md transition text-gray-300 hover:bg-light-white w-full text-left cursor-pointer"
                >
                  <span className="text-2xl block float-left">{Menu.icon}</span>
                  <span className={`text-base font-medium flex-1 duration-200 ${!isOpen && 'hidden'}`}>{Menu.title}</span>
                </button>
              ) : (
                <div className="flex items-center gap-x-4 p-2">
                  <span className="text-2xl block float-left">{Menu.icon}</span>
                  <span className={`text-base font-medium flex-1 duration-200 ${!isOpen && 'hidden'}`}>{Menu.title}</span>
                  {Menu.submenu && isOpen && (
                    <BsChevronDown className={`${submenuOpen ? 'rotate-180' : ''}`} onClick={() => setSubmenuOpen(!submenuOpen)} />
                  )}
                </div>
              )}
              {Menu.submenu && Menu.submenuItems && submenuOpen && isOpen && (
                <ul className="w-full">
                  {Menu.submenuItems.map((submenuItem, subIndex) => (
                    <li key={subIndex}>
                      <NavLink
                        to={submenuItem.path ?? '#'}
                        className={({ isActive }) =>
                          `text-gray-300 text-sm flex items-center gap-x-4 p-2 px-5 hover:bg-light-white rounded-md ml-12 transition ${
                            isActive ? 'bg-white text-dark-purple' : ''
                          }`
                        }
                      >
                        {submenuItem.title}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>



  );
};

export default Sidebar;