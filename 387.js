function present(encodings) {
        let table = "<table class='table table-hover table-sm table-bordered table-nonfluid'><tr><th>Encoding</th><th>Value</th></tr>";

        for (const enc in encodings) {
            const value = Utils.escapeHtml(Utils.printable(encodings[enc], true));
            table += `<tr><td>${enc}</td><td>${value}</td></tr>`;
        }

        table += "<table>";
        return table;
    }