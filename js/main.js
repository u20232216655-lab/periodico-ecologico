
"use strict";

// ==========================================
// ECOBYTE - PERIÓDICO DIGITAL
// Funcionalidades principales
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // ======================================
    // 1. NAVEGACIÓN Y MENÚ
    // ======================================

    const menuToggle = document.querySelector(".menu-toggle");
    const navbarDropdown = document.querySelector(".nav-dropdown");

    function closeNavigationMenu() {
        if (!menuToggle || !navbarDropdown) return;

        navbarDropdown.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Abrir menú");
    }

    function toggleNavigationMenu() {
        if (!menuToggle || !navbarDropdown) return;

        const isOpen = navbarDropdown.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Cerrar menú" : "Abrir menú"
        );
    }

    menuToggle?.addEventListener("click", toggleNavigationMenu);

    const navigationLinks = document.querySelectorAll(
        '.nav-dropdown a[href^="#"], .footer-links a[href^="#"], .hero-actions a[href^="#"]'
    );

    navigationLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (link.closest(".nav-dropdown")) {
                closeNavigationMenu();
            }
        });
    });

    document.addEventListener("click", event => {
        if (
            navbarDropdown &&
            menuToggle &&
            !navbarDropdown.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            closeNavigationMenu();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeNavigationMenu();
            menuToggle?.focus();
        }
    });


    // ======================================
    // 2. CALCULADORA DE IMPACTO AMBIENTAL
    // ======================================

    const phonesInput = document.getElementById("phones");
    const computersInput = document.getElementById("computers");
    const tabletsInput = document.getElementById("tablets");
    const reuseInput = document.getElementById("reuse");
    const calculateButton = document.getElementById("calculateButton");
    const reuseValue = document.getElementById("reuseValue");
    const totalWeight = document.getElementById("totalWeight");
    const reusableWeight = document.getElementById("reusableWeight");
    const calculatorMessage = document.getElementById("calculatorMessage");
    const reuseMeter = document.getElementById("reuseMeter");
    const reuseMeterFill = document.getElementById("reuseMeterFill");
    const reuseMeterLabel = document.getElementById("reuseMeterLabel");
    const calculatorBreakdown = document.getElementById("calculatorBreakdown");
    const deviceWeights = { phone: 0.2, computer: 2, tablet: 0.5 };
    const weightFormatter = new Intl.NumberFormat("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

    function getSafeQuantity(input) {
        if (!input || input.value.trim() === "") return 0;
        const value = Number(input.value);
        if (!Number.isFinite(value)) return 0;
        return Math.min(100, Math.max(0, Math.floor(value)));
    }
    function getSafePercentage(input) {
        if (!input) return 0;
        const value = Number(input.value);
        if (!Number.isFinite(value)) return 0;
        return Math.min(100, Math.max(0, value));
    }
    function formatWeight(value) { return weightFormatter.format(value); }
    function updateReuseLabel(percentage = getSafePercentage(reuseInput)) {
        if (reuseValue) reuseValue.textContent = `${percentage}%`;
        if (reuseMeterLabel) reuseMeterLabel.textContent = `${percentage}%`;
        if (reuseMeter) reuseMeter.setAttribute("aria-valuenow", String(percentage));
        if (reuseMeterFill) reuseMeterFill.style.width = `${percentage}%`;
    }
    function calculateImpact() {
        const phones = getSafeQuantity(phonesInput);
        const computers = getSafeQuantity(computersInput);
        const tablets = getSafeQuantity(tabletsInput);
        const percentage = getSafePercentage(reuseInput);
        const total = phones * deviceWeights.phone + computers * deviceWeights.computer + tablets * deviceWeights.tablet;
        const reusable = total * (percentage / 100);
        if (totalWeight) totalWeight.textContent = `${formatWeight(total)} kg`;
        if (reusableWeight) reusableWeight.textContent = `${formatWeight(reusable)} kg`;
        updateReuseLabel(percentage);
        if (calculatorBreakdown) calculatorBreakdown.textContent = total === 0
            ? "Aún no has agregado dispositivos."
            : `${phones} celulares · ${computers} computadores · ${tablets} tabletas`;
        if (calculatorMessage) {
            if (total === 0) calculatorMessage.textContent = "Agrega las cantidades de tus dispositivos. El cálculo se actualizará automáticamente.";
            else if (percentage === 0) calculatorMessage.textContent = `Tu inventario representa aproximadamente ${formatWeight(total)} kg. Con 0% de reutilización potencial, no se estima material aprovechable.`;
            else if (percentage === 100) calculatorMessage.textContent = `Tu inventario representa aproximadamente ${formatWeight(total)} kg. Si todos los equipos pudieran reutilizarse, ese sería el peso potencialmente aprovechable.`;
            else calculatorMessage.textContent = `Tus dispositivos representan aproximadamente ${formatWeight(total)} kg. Con un potencial de reutilización del ${percentage}%, podrían aprovecharse ${formatWeight(reusable)} kg.`;
        }
    }
    // Los resultados solo cambian cuando el usuario pulsa el botón.
    // El control deslizante actualiza únicamente su etiqueta y su indicador visual.
    [phonesInput, computersInput, tabletsInput].forEach(input => {
        input?.addEventListener("change", () => {
            if (input) input.value = String(getSafeQuantity(input));
        });
    });
    reuseInput?.addEventListener("input", () => updateReuseLabel());
    calculateButton?.addEventListener("click", calculateImpact);

    updateReuseLabel();
    if (calculatorBreakdown) calculatorBreakdown.textContent = "Completa las cantidades y pulsa «Calcular impacto».";
    if (calculatorMessage) calculatorMessage.textContent = "Ingresa tus dispositivos, ajusta el porcentaje de reutilización y calcula para conocer el peso total estimado y el material potencialmente aprovechable.";


    // 3. GRÁFICO INTERACTIVO: LA CIFRA DEL DÍA
    // ======================================

    const raeeChartCanvas = document.getElementById("raeeChart");
    const categoryFilter = document.getElementById("categoryFilter");
    const categoryInfo = document.getElementById("categoryInfo");

    const raeeCategories = [
        {
            id: "small",
            label: "Equipos pequeños",
            value: 127,
            description:
                "127 mil toneladas de equipos pequeños, como pequeños electrodomésticos."
        },
        {
            id: "temperature",
            label: "Intercambio de temperatura",
            value: 107,
            description:
                "107 mil toneladas de equipos de intercambio de temperatura, como neveras y aires acondicionados."
        },
        {
            id: "large",
            label: "Equipos grandes",
            value: 67,
            description:
                "67 mil toneladas de equipos grandes, como lavadoras y estufas."
        },
        {
            id: "screens",
            label: "Pantallas y monitores",
            value: 43,
            description:
                "43 mil toneladas de pantallas, televisores y monitores."
        },
        {
            id: "it",
            label: "Pequeños equipos informáticos",
            value: 32,
            description:
                "32 mil toneladas de pequeños equipos informáticos y de telecomunicaciones."
        },
        {
            id: "lamps",
            label: "Lámparas",
            value: 12,
            description:
                "12 mil toneladas de lámparas y equipos de iluminación."
        }
    ];

    let raeeChart = null;

    function updateRaeeChart() {

        if (!raeeChartCanvas) return;

        // Comprobar que Chart.js esté cargado
        if (typeof Chart === "undefined") {
            if (categoryInfo) {
                categoryInfo.textContent =
                    "No se pudo cargar el gráfico. Comprueba tu conexión a Internet.";
            }

            console.error("Chart.js no está disponible.");
            return;
        }

        const selectedCategory = categoryFilter?.value || "all";

        const filteredCategories = selectedCategory === "all"
            ? raeeCategories
            : raeeCategories.filter(
                category => category.id === selectedCategory
            );

        const labels = filteredCategories.map(
            category => category.label
        );

        const values = filteredCategories.map(
            category => category.value
        );

        // Destruir el gráfico anterior antes de crear uno nuevo
        if (raeeChart) {
            raeeChart.destroy();
        }

        raeeChart = new Chart(raeeChartCanvas, {
            type: "bar",

            data: {
                labels,
                datasets: [{
                    label: "Miles de toneladas",
                    data: values,
                    backgroundColor: "#174B35",
                    hoverBackgroundColor: "#C7E36A",
                    borderRadius: 7,
                    borderSkipped: false,
                    maxBarThickness: 34,
                    barPercentage: 0.72,
                    categoryPercentage: 0.78
                }]
            },

            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 650 },

                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: context => `${context.parsed.x} mil toneladas`
                        }
                    }
                },

                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "Miles de toneladas",
                            color: "#17271E",
                            font: { family: "DM Sans", weight: "600" }
                        },
                        ticks: {
                            color: "#68796D",
                            precision: 0
                        },
                        grid: { color: "#E3E9E1" }
                    },
                    y: {
                        grid: { display: false },
                        ticks: {
                            color: "#46574B",
                            autoSkip: false,
                            font: { family: "DM Sans", size: 12, weight: "600" },
                            padding: 9
                        }
                    }
                }
            }
        });

        // Actualizar descripción
        if (categoryInfo) {

            if (selectedCategory === "all") {
                categoryInfo.textContent =
                    "Se muestran las seis categorías de residuos electrónicos de Colombia.";
            } else if (filteredCategories.length > 0) {
                categoryInfo.textContent =
                    filteredCategories[0].description;
            } else {
                categoryInfo.textContent =
                    "No se encontraron datos para esta categoría.";
            }
        }
    }

    categoryFilter?.addEventListener("change", updateRaeeChart);

    // Crear el gráfico al cargar la página
    updateRaeeChart();


    // ======================================
    // 4. EXPERIENCIA DE LECTURA
    const readingProgressBar = document.getElementById("readingProgressBar");
    const backToTop = document.getElementById("backToTop");
    const editorialSections = document.querySelectorAll("main > section[id]");
    const sectionLinks = document.querySelectorAll('.nav-dropdown a[href^="#"]');

    function updateReadingProgress() {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
        if (readingProgressBar) readingProgressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        if (backToTop) backToTop.classList.toggle("is-visible", window.scrollY > 520);
    }
    window.addEventListener("scroll", updateReadingProgress, { passive: true });
    window.addEventListener("resize", updateReadingProgress);
    updateReadingProgress();
    backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    if ("IntersectionObserver" in window && editorialSections.length && sectionLinks.length) {
        const sectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                sectionLinks.forEach(link => {
                    const active = link.getAttribute("href") === `#${entry.target.id}`;
                    link.classList.toggle("is-current", active);
                    if (active) link.setAttribute("aria-current", "location");
                    else link.removeAttribute("aria-current");
                });
            });
        }, { rootMargin: "-22% 0px -62% 0px", threshold: 0 });
        editorialSections.forEach(section => sectionObserver.observe(section));
    }

    // 4. AÑO AUTOMÁTICO EN EL PIE DE PÁGINA
    // ======================================

    const footerYear = document.querySelector("[data-current-year]");

    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }


    // ======================================
    // 5. REGISTRO DE CARGA
    // ======================================

    console.info("ECOBYTE: periódico digital cargado correctamente.");

});
