(function () {
    const seedByMatric = {};
    (window.PROJECT_TRACKER_DEMO_STUDENTS || []).forEach(function (student, studentIndex) {
        const progress = Number(student.progress) || 0;
        seedByMatric[student.matric] = Array.from({ length: 16 }, function (_, index) {
            const week = index + 1;
            const start = Math.max(0, Math.round(progress * 0.18));
            const snapshot = Math.round(start + (progress - start) * (index / 15));
            return {
                week: week,
                progress: snapshot,
                documents: Math.min(2 + studentIndex % 3, Math.floor(week / 3) + 1),
                readiness: Math.min(8.7, Math.max(1.5, snapshot / 10 + ((week + studentIndex) % 3) * 0.25))
            };
        });
    });
    window.PROJECT_TRACKER_DUMMY_HISTORY = seedByMatric;
})();
