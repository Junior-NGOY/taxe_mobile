const html = `
        <html>
            <body style="text-align: center;">
                <h1 style="font-size: 40px; font-family: Helvetica Neue; font-weight: 500;margin: 0px">
                    {{ title }}
                </h1>
                <div style="text-align: center; margin: 0px: font-size: 20">-------------------------------</div>
                <h1 style="font-size: 35px; font-family: Helvetica Neue; font-weight: normal; margin: 0px">
                    {{ site }}
                </h1>
                <div style="text-align: center; font-size: 20px;">**************************************</div>
                <table style="font-size: 30px; margin: auto">
                    <tr>
                        <td>No.</td>
                        <td  style="text-align: right">{{ number }}</td>
                    </tr>
                    <tr>
                        <td>Mat.</td>
                        <td  style="text-align: right">{{ matricule }}</td>
                    </tr>
                    <tr>
                        <td>Type:</td>
                        <td style="text-align: right">{{ vehicle_type }}</td>
                    </tr>
                    <tr>
                        <td>
                            Date:
                        </td>
                        <td  style="text-align: right">{{ date }}</td>
                    </tr>
                    <tr>
                        <td>
                            Parking.
                        </td>
                        <td  style="text-align: right">{{ place }}</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="text-align: center; font-size: 20px;">===============</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="text-align: center; font-size: 30px;">Tax: {{ perceptor }}</td>
                    </tr>
                </table>
                <div style="text-align: center; font-size: 20px;">**************************************</div>
                <h1 style="font-size: 34px; font-family: Helvetica Neue; font-weight: 400; margin: 0px">
                    PRIX: {{ price }} Fc
                </h1>
                <div style="text-align: center; font-size: 20px;">**************************************</div>
                <div style="text-align: center; margin-top: 5; margin-bottom: 5">
                    <img src=" data:image/jpeg;charset=utf-8;base64,iVBORw0KGgoAAAANSUhEUgAAAIwAAACMCAYAAACuwEE+AAAABHNCSVQICAgIfAhkiAAABwJJREFU
                    eJztndFx2zgURaGd/EcdmB1IHZCuxCohqYBUBVEJVCWkO5A7oDqQK+B+ZLOzDt/z8C4AmlbOmcGH
                    NTBBQHdEAHwXL4QQxrWWruvGudR1bV5DoSzL2fdW13X0vVn967ruw8f9vfJXABBAMCCBYEACwYDE
                    F+vDsixDVVWL3UTf9+H5+Xmx9hQeHh7C4XCYfO6Nz/F4nHyWom9r+U5MwVRVFZqmyX1P/9I0zWoF
                    UxSFNBa5xm0t3wmPJJBAMCCBYEACwYCEOen1+PbtW3h5eYlqsOu6qP+/XC7h+/fvk8+HYZh9jbZt
                    w/l8nnwe27eP4PHxMer/d7tdOJ1Os+tLgrlcLh++mrndbqHv+6hrDMMQfY21ENuPcRyl+jySQALB
                    gASCAQlpDvMZseZc1+vVrLvb7cJ2u33z2X6/N+sOw+Be5565e8Eo719Op9Ps+m3bmu+N7h0eSSCB
                    YEACwYAEggGJu5/0KpzP59k72cqOtxf8VBTF7GusBQTzH9q2zXLdpYOfcsIjCSQQDEggGJBAMCAh
                    Cabv+zCOY1RZmtj79QK+6rqe3b/j8Rg2m82kpIjJie2feg/8woAEggEJBAMSCAYkzJ3e5+fnRWM9
                    cnqPrX54ddu2nQRFjeMY6ro227SubdVN4R1f03fy4acaeUU5ock7EUqpa51AVZalWVc58YoTqOCP
                    BcGABIIBCQQDEl9ivc458SwesXiBUpa3+uXlxfQvK17uw+Fgrsqs/u33+2j/eVbMaf2KSbFKylnu
                    HR5JIIFgQALBgMQXa/L38PBgRrRfLpfw+vq6wG39xPI6b7fbUJblpK4XgW/V9VD6542RhefDtvp3
                    u90WPdjo69ev8uIiaus8Z1GSU6TgT0xO4b368OCRBBIIBiQQDEggGJDYhJ+TnzfUdW1aO6uqmh0I
                    lCqZwmazefO3lyzCC1Lygp8s2raVtvx/vzePvu/N6PzD4TBZaY2is0IJEPOY249fZFklKasIj1wB
                    TSnw2ost6qolduzVVRmPJJBAMCCBYEACwYDMolvRSknhGrBIsVWfor1cJeeihV8YkEAwIIFgQALB
                    gMTmnwnZG7xt9qenp8lW9jAMZnazFF5na+t8GAb3tMvYrfqu6yb3obZnvYpomibaF62MZ1VVZt1R
                    fO1gjufSqwilrkKKlYgSsJXCW62UFK6IFP3jkQQSCAYkEAxIIBiQ2FRVNZk6D8NgBhLt93vTFnG5
                    XCZ1i6IwbRjW6sSrq+CtIixf9NPTkxmEZZ1A5eGN0WisRLy6Sh5wL6jNWsnk7F8IC77jyFlynUCl
                    FoUU73aW7h+PJJBAMCCBYEDCPHZV8Q17eH5ixeusEnu0qeIx9vqn3IMyxop33Ktr9c/zcr+ngdmT
                    JoU1R/F/xlcRuVBf7fBIAgkEAxIIBiQQDEhIaYiVreUQ5vuaUwRseasTJbGEheflTuEbt/qtesdj
                    8bb/30uGkWVreS0nNCntWUX1Oiuk8I4vXXgkgQSCAQkEAxIIBiQWF4yVvzmEYOZUbppmUtcKiArB
                    zyNttefN/ruum53X2bo39SQnhaZpZufJ9sYixXs8fmFAAsGABIIBCQQDEtKrAS+zmMfcvM5eXes1
                    hLd1rrSnbLN7ryK8a1t47Vn9u16v2fJTK9/fe2P04QFUKbbql84j/RlPoFLAWw1JQDAggWBAAsGA
                    hJm3OtZiEoI2I1fqDsNgvh4oy3J2vmevvbZtJyuU2+0265q/UHJc//jxIzo3t/eqJBb3O4meTi9M
                    ilWLRy6vs1dS2ExyjYUHjySQQDAggWBAwsxbvRaUvNUh2M4BJQZE8R57WO15PmyL/+N1/p3r9WqO
                    Rao82YtuWysl1zGoCmtPhhE7nmRkg6wgGJBAMCCBYEDCDKBKlXN6LksHNHlY3nElj3UIdhCXeiqV
                    1Q/l+/C+P2ucx3GUg8wW3Vq2WDqgyePeXw2k8HLzSAIJBAMSCAYkEAxISIKpqsr0Eytlaax7sJI8
                    eJRl6fq+Y3l8fMwynsfj0e337/3wvOMe/MKABIIBCQQDEggGJCRv9Zp575jQuViR8ikcFB7WsbIe
                    KY5dPZ/Ps6/h1bsbwXjJyxU8k38uFHtN0zTRgvEStivwSAIJBAMSCAYkEAxI3M2k18vVbNH3/WxP
                    8m63C6fTafZ9zPV3h2B7ub32vAlyrLfaa69tWzNQ7W4EUxSFdBzX3BXV6JyF66FExlkrH6+9FMng
                    LbbbrRudZ8EjCSQQDEggGJCQ5jCxh9+kIKe32vIeL93n19dXsx8pcokrFEXhjt2ncg2o18jVXgqW
                    dilYRc04xyMJJBAMSCAYkEAwIGGuklIEIykocR6qt1rxOlsBRu8lw8iBmic71k/urbwkb/VaytIn
                    NFllLXmrlwZvNSQBwYAEggEJBAMSfwMZtgyHbf/ZcgAAAABJRU5ErkJggg==" width="100"/>
                </div>
                <div style="text-align: center; font-size: 20px;">**************************************</div>
            </body>
        </html>
    `;
export { html };

export interface Invoice { 
    matricule: string, 
    tarification: {
        id: string,
        name: string, 
        price: number,
        code?: string
    },
    amount?: string,
    createdAt?: Date,
    localId?: string,
    number?: string
}

export interface Session {
    id: string,
    account: {
        person: {
            name: string
        }
    },
    missing?: string,
    site: {
        id?: number,
        name: string
    }
}