export const scrollToSection = (id, router, pathname) => {
    if (pathname !== '/') {
        // Navigate to home page first
        router.push('/');

        // Delay scrolling until after route change
        // Use a slight delay to allow the DOM to mount
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        }, 400); // Might adjust based on how long it takes to load homepage
    } else {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    }
};