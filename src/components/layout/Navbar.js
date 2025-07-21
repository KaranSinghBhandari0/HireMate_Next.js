"use client";

import { useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap, Menu, X } from "lucide-react";
import UserDropdown from "../ui/UserDropdown";
import { AuthContext } from "@/context/AuthContext";
import { scrollToSection } from "@/utils/ScrollToSection";

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const closeMenu = () => setIsOpen(false);

    const scrollToTop = () => {
        if (pathname !== "/") {
            router.push("/");
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }, 300);
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const navLinks = [
        { href: "/", label: "Home", onClick: scrollToTop },
        { href: "/job", label: "Jobs" },
        { label: "Features", scrollId: "features" },
        { label: "How it works", scrollId: "how-it-works" },
        { label: "Pricing", scrollId: "pricing" },
        { label: "Testimonials", scrollId: "testimonials" },
    ];

    return (
        <nav className="bg-white shadow-sm py-4 px-6 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link
                    href="/"
                    onClick={(e) => {
                        e.preventDefault();
                        scrollToTop();
                    }}
                    className="flex items-center space-x-2"
                >
                    <div className="flex items-center justify-center bg-green-500 text-white rounded-full w-10 h-10 shadow-md">
                        <GraduationCap size={20} className="animate-pulse" />
                    </div>
                    <p className="text-2xl font-bold text-green-500">HireMate</p>
                </Link>

                <DesktopNav navLinks={navLinks} user={user} router={router} pathname={pathname} />

                {/* Menu Icon */}
                <button
                    className="lg:hidden text-gray-600"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle Menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Background overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                    onClick={closeMenu}
                />
            )}

            <MobileMenu
                isOpen={isOpen}
                closeMenu={closeMenu}
                navLinks={navLinks}
                user={user}
                logout={logout}
                router={router}
                pathname={pathname}
            />
        </nav>
    );
}

// NavLink component
const NavLink = ({ href, label, onClick, scrollId, closeMenu, router, pathname }) => {
    if (href) {
        return (
            <Link
                href={href}
                className="text-gray-600 hover:text-green-500 transition-colors"
                onClick={(e) => {
                    closeMenu?.();
                    if (onClick) {
                        e.preventDefault();
                        onClick();
                    }
                }}
            >
                {label}
            </Link>
        );
    }

    return (
        <button
            onClick={() => {
                closeMenu?.();
                scrollId && scrollToSection(scrollId, router, pathname);
            }}
            className="text-gray-600 hover:text-green-500 transition-colors text-left"
        >
            {label}
        </button>
    );
};

// MobileMenu component
const MobileMenu = ({ isOpen, closeMenu, navLinks, user, logout, router, pathname }) => {
    const menuRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                closeMenu();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div
            ref={menuRef}
            className={`lg:hidden fixed inset-y-0 right-0 w-full max-w-[250px] bg-white shadow-lg transform ${
                isOpen ? "translate-x-0" : "translate-x-full"
            } transition-transform duration-300 ease-in-out z-50`}
        >
            <div className="flex flex-col h-full p-4 overflow-y-auto">
                <button
                    className="self-end p-2 text-gray-600"
                    onClick={closeMenu}
                    aria-label="Close Menu"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-start space-y-6 mt-4 pl-2">
                    {navLinks.map((link, idx) => (
                        <NavLink
                            key={idx}
                            href={link.href}
                            label={link.label}
                            onClick={link.onClick}
                            scrollId={link.scrollId}
                            closeMenu={closeMenu}
                            router={router}
                            pathname={pathname}
                        />
                    ))}

                    {user && (
                        <Link
                            href="/interview/history"
                            className="text-gray-600 hover:text-green-500"
                            onClick={closeMenu}
                        >
                            Interview History
                        </Link>
                    )}

                    <Link
                        href="/admin"
                        className="text-gray-600 hover:text-green-500"
                        onClick={closeMenu}
                    >
                        Admin
                    </Link>
                </div>

                <div className="flex flex-col space-y-3 pt-8 mt-auto">
                    {user ? (
                        <>
                            <Link
                                href="/auth/profile"
                                className="text-center text-gray-600 hover:text-green-500"
                                onClick={closeMenu}
                            >
                                Profile
                            </Link>
                            <button
                                className="text-red-500 bg-red-100 font-medium py-2 px-4 rounded-md"
                                onClick={() => {
                                    logout();
                                    closeMenu();
                                }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/auth/login"
                                className="text-center font-medium text-sm text-gray-600 py-2 px-4 rounded-md hover:bg-gray-100"
                                onClick={closeMenu}
                            >
                                Login
                            </Link>
                            <Link
                                href="/auth/signup"
                                className="text-center bg-green-500 font-medium text-sm text-white py-2 px-4 rounded-md hover:bg-green-600"
                                onClick={closeMenu}
                            >
                                Sign Up Free
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// DesktopNav component
const DesktopNav = ({ navLinks, user, router, pathname }) => {
    return (
        <>
            <div className="hidden lg:flex space-x-8">
                {navLinks.map((link, idx) => (
                    <NavLink
                        key={idx}
                        href={link.href}
                        label={link.label}
                        onClick={link.onClick}
                        scrollId={link.scrollId}
                        router={router}
                        pathname={pathname}
                    />
                ))}
            </div>

            {user ? (
                <UserDropdown />
            ) : (
                <div className="hidden lg:flex items-center space-x-4">
                    <Link
                        href="/auth/login"
                        className="text-gray-600 font-medium text-sm py-2 px-3 rounded-md hover:bg-gray-100"
                    >
                        Login
                    </Link>
                    <Link
                        href="/auth/signup"
                        className="bg-green-500 text-white font-medium text-sm py-2 px-4 rounded-md hover:bg-green-600"
                    >
                        Sign Up Free
                    </Link>
                </div>
            )}
        </>
    );
};
