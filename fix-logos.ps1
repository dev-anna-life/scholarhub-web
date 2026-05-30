$OutputDir = "C:\Users\USER\scholarhub-nextjs\public\images\schools"
$userAgent = "ScholarHub/1.0 (contact@scholarhub.com)"

function Get-WikidataLogoUrl {
    param([string]$Title)
    $encoded = [Uri]::EscapeDataString($Title)
    $ppUrl = "https://en.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=pageprops&format=json&ppprop=wikibase_item"
    try {
        $ppResult = Invoke-RestMethod -Uri $ppUrl -Method Get -UserAgent $userAgent -ErrorAction Stop
        $pages = $ppResult.query.pages
        $pageId = ($pages.PSObject.Properties | Select-Object -First 1).Name
        if ($pageId -eq "-1") { return $null }
        $wikidataId = $pages.$pageId.pageprops.wikibase_item
        if (-not $wikidataId) { return $null }
        
        $wdUrl = "https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikidataId}&props=claims&format=json"
        $wdResult = Invoke-RestMethod -Uri $wdUrl -Method Get -UserAgent $userAgent -ErrorAction Stop
        
        # Try P154 (logo), P41 (flag), P18 (image)
        foreach ($prop in @("P154", "P41", "P18")) {
            if ($wdResult.entities.$wikidataId.claims.$prop) {
                foreach ($claim in $wdResult.entities.$wikidataId.claims.$prop) {
                    if ($claim.mainsnak.datavalue.value) {
                        $filename = $claim.mainsnak.datavalue.value
                        if ($filename -is [string] -and $filename.Length -gt 0) {
                            $encFile = [Uri]::EscapeDataString($filename)
                            return "https://commons.wikimedia.org/wiki/Special:FilePath/${encFile}?width=500"
                        }
                    }
                }
            }
        }
    } catch { }
    return $null
}

function Download-Img {
    param([string]$Url, [string]$Path)
    if (-not $Url) { return $false }
    try {
        Invoke-WebRequest -Uri $Url -OutFile $Path -UserAgent $userAgent -ErrorAction Stop
        if ((Get-Item $Path).Length -gt 100) { return $true }
    } catch { }
    return $false
}

# Schools that need logo fixes (got wrong/generic images or placeholders)
$FixList = @(
    @{Slug = "queens-college-lagos";       Wiki = "Queen's College, Lagos"},
    @{Slug = "government-secondary-school-enugu";  Wiki = "Government Secondary School, Enugu"},
    @{Slug = "federal-government-college-ilorin";  Wiki = "Federal Government College, Ilorin"},
    @{Slug = "st-josephs-college-durban";  Wiki = "St. Joseph's College, Durban"},
    @{Slug = "lycee-sainte-famille-abidjan"; Wiki = "Lycée Sainte Famille, Abidjan"},
    @{Slug = "universite-cheikh-anta-diop"; Wiki = "Université Cheikh Anta Diop"}
)

Write-Host "=== Trying to fix problematic schools ===" -ForegroundColor Cyan

foreach ($s in $FixList) {
    $slug = $s.Slug
    $wiki = $s.Wiki
    $pngPath = Join-Path $OutputDir "${slug}.png"
    $svgPath = Join-Path $OutputDir "${slug}.svg"
    
    Write-Host "[${slug}] Trying Wikidata/Commons..." -ForegroundColor Yellow
    
    $downloaded = $false
    
    # Try Wikidata
    $url = Get-WikidataLogoUrl -Title $wiki
    if ($url) {
        Write-Host "  Wikidata URL: $url"
        $downloaded = Download-Img -Url $url -Path $pngPath
    }
    
    # Try Wikipedia summary
    if (-not $downloaded) {
        $encoded = [Uri]::EscapeDataString($wiki)
        $summaryUrl = "https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}"
        try {
            $summary = Invoke-RestMethod -Uri $summaryUrl -Method Get -UserAgent $userAgent -ErrorAction Stop
            if ($summary.originalimage -and $summary.originalimage.source) {
                $downloaded = Download-Img -Url $summary.originalimage.source -Path $pngPath
            } elseif ($summary.thumbnail -and $summary.thumbnail.source) {
                $downloaded = Download-Img -Url $summary.thumbnail.source -Path $pngPath
            }
        } catch { }
    }
    
    # Try pageimages
    if (-not $downloaded) {
        $encoded = [Uri]::EscapeDataString($wiki)
        $piUrl = "https://en.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=pageimages&format=json&pithumbsize=500"
        try {
            $piResult = Invoke-RestMethod -Uri $piUrl -Method Get -UserAgent $userAgent -ErrorAction Stop
            $pages = $piResult.query.pages
            $pageId = ($pages.PSObject.Properties | Select-Object -First 1).Name
            if ($pageId -ne "-1" -and $pages.$pageId.thumbnail) {
                $downloaded = Download-Img -Url $pages.$pageId.thumbnail.source -Path $pngPath
            }
        } catch { }
    }
    
    if ($downloaded) {
        Write-Host "  -> SUCCESS" -ForegroundColor Green
        if (Test-Path $svgPath) { Remove-Item $svgPath -Force }
    } else {
        Write-Host "  -> Still failing, keeping placeholder" -ForegroundColor Red
    }
}

# Now also try to get actual logos for all schools that have P154
Write-Host "`n=== Checking for P154 logos across all schools ===" -ForegroundColor Cyan

$AllSchools = @(
    @{Slug = "kings-college-lagos";             Wiki = "King's College, Lagos"},
    @{Slug = "loyola-jesuit-college-abuja";     Wiki = "Loyola Jesuit College"},
    @{Slug = "queens-college-lagos";            Wiki = "Queen's College, Lagos"},
    @{Slug = "achimota-school-accra";           Wiki = "Achimota School"},
    @{Slug = "ghana-national-college";          Wiki = "Ghana National College"},
    @{Slug = "st-augustines-college-cape-coast"; Wiki = "St. Augustine's College (Cape Coast)"},
    @{Slug = "bishops-diocesan-college-cape-town"; Wiki = "Diocesan College"},
    @{Slug = "university-of-ibadan";            Wiki = "University of Ibadan"},
    @{Slug = "obafemi-awolowo-university";     Wiki = "Obafemi Awolowo University"},
    @{Slug = "university-of-lagos";            Wiki = "University of Lagos"},
    @{Slug = "covenant-university";            Wiki = "Covenant University"},
    @{Slug = "university-of-nigeria-nsukka";   Wiki = "University of Nigeria, Nsukka"},
    @{Slug = "ahmadu-bello-university";        Wiki = "Ahmadu Bello University"},
    @{Slug = "federal-university-of-technology-owerri"; Wiki = "Federal University of Technology Owerri"},
    @{Slug = "university-of-benin";            Wiki = "University of Benin"},
    @{Slug = "lagos-state-university";         Wiki = "Lagos State University"},
    @{Slug = "nnamdi-azikiwe-university";      Wiki = "Nnamdi Azikiwe University"},
    @{Slug = "university-of-nairobi";          Wiki = "University of Nairobi"},
    @{Slug = "kenyatta-university";            Wiki = "Kenyatta University"},
    @{Slug = "strathmore-university";          Wiki = "Strathmore University"},
    @{Slug = "moi-university";                 Wiki = "Moi University"},
    @{Slug = "egerton-university";             Wiki = "Egerton University"},
    @{Slug = "university-of-ghana";            Wiki = "University of Ghana"},
    @{Slug = "kwame-nkrumah-university-of-science-and-technology"; Wiki = "Kwame Nkrumah University of Science and Technology"},
    @{Slug = "university-of-cape-coast";       Wiki = "University of Cape Coast"},
    @{Slug = "university-of-cape-town";        Wiki = "University of Cape Town"},
    @{Slug = "university-of-the-witwatersrand"; Wiki = "University of the Witwatersrand"},
    @{Slug = "stellenbosch-university";        Wiki = "Stellenbosch University"},
    @{Slug = "university-of-pretoria";         Wiki = "University of Pretoria"},
    @{Slug = "rhodes-university";              Wiki = "Rhodes University"},
    @{Slug = "university-of-johannesburg";     Wiki = "University of Johannesburg"},
    @{Slug = "makerere-university";            Wiki = "Makerere University"},
    @{Slug = "addis-ababa-university";         Wiki = "Addis Ababa University"},
    @{Slug = "university-of-dar-es-salaam";    Wiki = "University of Dar es Salaam"},
    @{Slug = "cairo-university";               Wiki = "Cairo University"},
    @{Slug = "university-of-khartoum";         Wiki = "University of Khartoum"},
    @{Slug = "university-of-botswana";         Wiki = "University of Botswana"},
    @{Slug = "universite-cheikh-anta-diop";    Wiki = "Université Cheikh Anta Diop"}
)

foreach ($s in $AllSchools) {
    $slug = $s.Slug
    $wiki = $s.Wiki
    $pngPath = Join-Path $OutputDir "${slug}.png"
    
    # Only try to replace if we already have a file
    if (-not (Test-Path $pngPath)) { continue }
    
    # Try to get the Wikidata P154 logo (actual logo)
    $encoded = [Uri]::EscapeDataString($wiki)
    $ppUrl = "https://en.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=pageprops&format=json&ppprop=wikibase_item"
    try {
        $ppResult = Invoke-RestMethod -Uri $ppUrl -Method Get -UserAgent $userAgent -ErrorAction Stop
        $pages = $ppResult.query.pages
        $pageId = ($pages.PSObject.Properties | Select-Object -First 1).Name
        if ($pageId -eq "-1") { continue }
        $wikidataId = $pages.$pageId.pageprops.wikibase_item
        if (-not $wikidataId) { continue }
        
        $wdUrl = "https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikidataId}&props=claims&format=json"
        $wdResult = Invoke-RestMethod -Uri $wdUrl -Method Get -UserAgent $userAgent -ErrorAction Stop
        
        # Only P154 (actual logo)
        if ($wdResult.entities.$wikidataId.claims.P154) {
            foreach ($claim in $wdResult.entities.$wikidataId.claims.P154) {
                if ($claim.mainsnak.datavalue.value) {
                    $filename = $claim.mainsnak.datavalue.value
                    $encFile = [Uri]::EscapeDataString($filename)
                    $url = "https://commons.wikimedia.org/wiki/Special:FilePath/${encFile}?width=500"
                    
                    Write-Host "[${slug}] Found P154 logo: ${filename}" -ForegroundColor Green
                    $success = Download-Img -Url $url -Path $pngPath
                    if ($success) {
                        Write-Host "  -> Downloaded P154 logo!" -ForegroundColor Green
                    }
                    break
                }
            }
        }
    } catch { }
    
    Start-Sleep -Milliseconds 300
}

# Final check
Write-Host "`n=== Final file listing ===" -ForegroundColor Cyan
Get-ChildItem -Path $OutputDir | Select-Object Name, @{N="SizeKB";E={[math]::Round($_.Length/1KB, 1)}} | Sort-Object Name | Format-Table -AutoSize
