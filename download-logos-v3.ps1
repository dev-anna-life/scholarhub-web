$OutputDir = "C:\Users\USER\scholarhub-nextjs\public\images\schools"

# Schools with their most likely Wikipedia page titles
$Schools = @(
    @{Slug = "kings-college-lagos"; Wiki = "King's College, Lagos"},
    @{Slug = "loyola-jesuit-college-abuja"; Wiki = "Loyola Jesuit College"},
    @{Slug = "queens-college-lagos"; Wiki = "Queen's College, Lagos"},
    @{Slug = "government-secondary-school-enugu"; Wiki = "Government Secondary School, Enugu"},
    @{Slug = "federal-government-college-ilorin"; Wiki = "Federal Government College, Ilorin"},
    @{Slug = "alliance-high-school-nairobi"; Wiki = "Alliance High School (Kenya)"},
    @{Slug = "st-georges-college-nairobi"; Wiki = "St. George's College, Nairobi"},
    @{Slug = "st-marys-school-nairobi"; Wiki = "St. Mary's School, Nairobi"},
    @{Slug = "international-school-of-kenya"; Wiki = "International School of Kenya"},
    @{Slug = "mpesa-foundation-academy"; Wiki = "Mpesa Foundation Academy"},
    @{Slug = "hillcrest-secondary-school-nairobi"; Wiki = "Hillcrest Secondary School, Nairobi"},
    @{Slug = "achimota-school-accra"; Wiki = "Achimota School"},
    @{Slug = "ghana-national-college"; Wiki = "Ghana National College"},
    @{Slug = "st-augustines-college-cape-coast"; Wiki = "St. Augustine's College (Cape Coast)"},
    @{Slug = "st-johns-college-johannesburg"; Wiki = "St. John's College, Johannesburg"},
    @{Slug = "bishops-diocesan-college-cape-town"; Wiki = "Diocesan College"},
    @{Slug = "st-josephs-college-durban"; Wiki = "St. Joseph's College, Durban"},
    @{Slug = "st-charles-lwanga-school-kampala"; Wiki = "St. Charles Lwanga School, Kampala"},
    @{Slug = "sos-hermann-gmeiner-school-addis-ababa"; Wiki = "SOS Hermann Gmeiner School, Addis Ababa"},
    @{Slug = "lycee-sainte-famille-abidjan"; Wiki = "Lycée Sainte Famille, Abidjan"},
    @{Slug = "university-of-ibadan"; Wiki = "University of Ibadan"},
    @{Slug = "obafemi-awolowo-university"; Wiki = "Obafemi Awolowo University"},
    @{Slug = "university-of-lagos"; Wiki = "University of Lagos"},
    @{Slug = "covenant-university"; Wiki = "Covenant University"},
    @{Slug = "university-of-nigeria-nsukka"; Wiki = "University of Nigeria, Nsukka"},
    @{Slug = "ahmadu-bello-university"; Wiki = "Ahmadu Bello University"},
    @{Slug = "federal-university-of-technology-owerri"; Wiki = "Federal University of Technology Owerri"},
    @{Slug = "university-of-benin"; Wiki = "University of Benin"},
    @{Slug = "lagos-state-university"; Wiki = "Lagos State University"},
    @{Slug = "nnamdi-azikiwe-university"; Wiki = "Nnamdi Azikiwe University"},
    @{Slug = "university-of-nairobi"; Wiki = "University of Nairobi"},
    @{Slug = "kenyatta-university"; Wiki = "Kenyatta University"},
    @{Slug = "strathmore-university"; Wiki = "Strathmore University"},
    @{Slug = "moi-university"; Wiki = "Moi University"},
    @{Slug = "egerton-university"; Wiki = "Egerton University"},
    @{Slug = "university-of-ghana"; Wiki = "University of Ghana"},
    @{Slug = "kwame-nkrumah-university-of-science-and-technology"; Wiki = "Kwame Nkrumah University of Science and Technology"},
    @{Slug = "university-of-cape-coast"; Wiki = "University of Cape Coast"},
    @{Slug = "university-of-cape-town"; Wiki = "University of Cape Town"},
    @{Slug = "university-of-the-witwatersrand"; Wiki = "University of the Witwatersrand"},
    @{Slug = "stellenbosch-university"; Wiki = "Stellenbosch University"},
    @{Slug = "university-of-pretoria"; Wiki = "University of Pretoria"},
    @{Slug = "rhodes-university"; Wiki = "Rhodes University"},
    @{Slug = "university-of-johannesburg"; Wiki = "University of Johannesburg"},
    @{Slug = "makerere-university"; Wiki = "Makerere University"},
    @{Slug = "addis-ababa-university"; Wiki = "Addis Ababa University"},
    @{Slug = "university-of-dar-es-salaam"; Wiki = "University of Dar es Salaam"},
    @{Slug = "cairo-university"; Wiki = "Cairo University"},
    @{Slug = "university-of-khartoum"; Wiki = "University of Khartoum"},
    @{Slug = "university-of-botswana"; Wiki = "University of Botswana"},
    @{Slug = "universite-cheikh-anta-diop"; Wiki = "Université Cheikh Anta Diop"}
)

# Set up a proper User-Agent
$userAgent = "ScholarHub/1.0 (scholarhub-app; contact@scholarhub.com)"

function Get-ImageUrlFromSummary {
    param([string]$Title)
    $encoded = [Uri]::EscapeDataString($Title)
    $url = "https://en.wikipedia.org/api/rest_v1/page/summary/$encoded"
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -UserAgent $userAgent -ErrorAction Stop
        if ($response.originalimage -and $response.originalimage.source) {
            return $response.originalimage.source
        }
        if ($response.thumbnail -and $response.thumbnail.source) {
            return $response.thumbnail.source
        }
    } catch { }
    return $null
}

function Get-ImageUrlFromPageImages {
    param([string]$Title)
    $encoded = [Uri]::EscapeDataString($Title)
    $url = "https://en.wikipedia.org/w/api.php?action=query&titles=$encoded&prop=pageimages&format=json&pithumbsize=500"
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -UserAgent $userAgent -ErrorAction Stop
        $pages = $response.query.pages
        $pageId = ($pages.PSObject.Properties | Select-Object -First 1).Name
        if ($pageId -ne "-1" -and $pages.$pageId.thumbnail) {
            return $pages.$pageId.thumbnail.source
        }
    } catch { }
    return $null
}

function Get-ImageUrlFromWikidata {
    param([string]$Title)
    $encoded = [Uri]::EscapeDataString($Title)
    
    # Get Wikidata ID
    $ppUrl = "https://en.wikipedia.org/w/api.php?action=query&titles=$encoded&prop=pageprops&format=json&ppprop=wikibase_item"
    try {
        $ppResult = Invoke-RestMethod -Uri $ppUrl -Method Get -UserAgent $userAgent -ErrorAction Stop
        $pages = $ppResult.query.pages
        $pageId = ($pages.PSObject.Properties | Select-Object -First 1).Name
        if ($pageId -eq "-1") { return $null }
        $wikidataId = $pages.$pageId.pageprops.wikibase_item
        if (-not $wikidataId) { return $null }
        
        # Get P154 (logo) from Wikidata
        $wdUrl = "https://www.wikidata.org/w/api.php?action=wbgetentities&ids=$wikidataId&props=claims&format=json"
        $wdResult = Invoke-RestMethod -Uri $wdUrl -Method Get -UserAgent $userAgent -ErrorAction Stop
        
        # Try P154 (logo) first
        if ($wdResult.entities.$wikidataId.claims.P154) {
            $filename = $wdResult.entities.$wikidataId.claims.P154[0].mainsnak.datavalue.value
            $encodedFile = [Uri]::EscapeDataString($filename)
            return "https://commons.wikimedia.org/wiki/Special:FilePath/$encodedFile?width=500"
        }
    } catch { }
    return $null
}

function Get-ImageUrlsFromWikidataImages {
    param([string]$Title)
    $results = @()
    $encoded = [Uri]::EscapeDataString($Title)
    
    $ppUrl = "https://en.wikipedia.org/w/api.php?action=query&titles=$encoded&prop=pageprops&format=json&ppprop=wikibase_item"
    try {
        $ppResult = Invoke-RestMethod -Uri $ppUrl -Method Get -UserAgent $userAgent -ErrorAction Stop
        $pages = $ppResult.query.pages
        $pageId = ($pages.PSObject.Properties | Select-Object -First 1).Name
        if ($pageId -eq "-1") { return $results }
        $wikidataId = $pages.$pageId.pageprops.wikibase_item
        if (-not $wikidataId) { return $results }
        
        $wdUrl = "https://www.wikidata.org/w/api.php?action=wbgetentities&ids=$wikidataId&props=claims&format=json"
        $wdResult = Invoke-RestMethod -Uri $wdUrl -Method Get -UserAgent $userAgent -ErrorAction Stop
        
        $propsToTry = @("P154", "P41", "P18", "P948", "P2425")
        foreach ($prop in $propsToTry) {
            if ($wdResult.entities.$wikidataId.claims.$prop) {
                foreach ($claim in $wdResult.entities.$wikidataId.claims.$prop) {
                    if ($claim.mainsnak.datavalue.value) {
                        $filename = $claim.mainsnak.datavalue.value
                        $encodedFile = [Uri]::EscapeDataString($filename)
                        $results += "https://commons.wikimedia.org/wiki/Special:FilePath/$encodedFile?width=500"
                    }
                }
            }
        }
    } catch { }
    return $results
}

function Download-Image {
    param([string]$Url, [string]$FilePath)
    
    if (-not $Url) { return $false }
    
    # Ensure HTTPS
    $Url = $Url -replace "^http://", "https://"
    
    # Try with Invoke-WebRequest (sets proper User-Agent by default)
    try {
        Write-Host "    Trying Invoke-WebRequest: $Url"
        Invoke-WebRequest -Uri $Url -OutFile $FilePath -UserAgent $userAgent -ErrorAction Stop
        if ((Get-Item $FilePath).Length -gt 100) {
            return $true
        }
    } catch {
        Write-Host "    Invoke-WebRequest failed: $($_.Exception.Message)"
    }
    
    # Try with WebClient as fallback
    try {
        Write-Host "    Trying WebClient"
        $wc = New-Object System.Net.WebClient
        $wc.Headers.Add("User-Agent", $userAgent)
        $wc.DownloadFile($Url, $FilePath)
        $wc.Dispose()
        if ((Get-Item $FilePath).Length -gt 100) {
            return $true
        }
    } catch {
        Write-Host "    WebClient failed: $($_.Exception.Message)"
    }
    
    return $false
}

function Create-Placeholder {
    param([string]$FilePath, [string]$Slug)
    $svgContent = @"
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#f5f5f5"/>
  <rect x="5" y="5" width="190" height="190" fill="none" stroke="#ddd" stroke-width="2" rx="8"/>
  <text x="100" y="100" text-anchor="middle" fill="#bbb" font-family="Arial,sans-serif" font-size="13">No Logo</text>
</svg>
"@
    Set-Content -Path $FilePath -Value $svgContent -Encoding UTF8
}

$Results = @()
$total = $Schools.Count
$current = 0

foreach ($school in $Schools) {
    $current++
    $slug = $school.Slug
    $wikiTitle = $school.Wiki
    $pngPath = Join-Path $OutputDir "$slug.png"
    $svgPath = Join-Path $OutputDir "$slug.svg"
    
    Write-Host "[$current/$total] $slug" -ForegroundColor Cyan
    
    $downloaded = $false
    
    # Method 1: Get logo from Wikidata P154 (most accurate)
    Write-Host "  -> Wikidata logo..."
    $urls = Get-ImageUrlsFromWikidataImages -Title $wikiTitle
    foreach ($url in $urls) {
        if (-not $downloaded) {
            $downloaded = Download-Image -Url $url -FilePath $pngPath
        }
    }
    
    # Method 2: Wikipedia REST summary
    if (-not $downloaded) {
        Write-Host "  -> Wikipedia summary..."
        $url = Get-ImageUrlFromSummary -Title $wikiTitle
        if ($url) {
            $downloaded = Download-Image -Url $url -FilePath $pngPath
        }
    }
    
    # Method 3: Wikipedia pageimages
    if (-not $downloaded) {
        Write-Host "  -> Wikipedia pageimages..."
        $url = Get-ImageUrlFromPageImages -Title $wikiTitle
        if ($url) {
            $downloaded = Download-Image -Url $url -FilePath $pngPath
        }
    }
    
    # Method 4: Try alternative titles by removing location
    if (-not $downloaded -and $wikiTitle -match ", ") {
        $altTitle = ($wikiTitle -split ", ")[0]
        Write-Host "  -> Trying simplified title: $altTitle"
        
        $urls = Get-ImageUrlsFromWikidataImages -Title $altTitle
        foreach ($url in $urls) {
            if (-not $downloaded) {
                $downloaded = Download-Image -Url $url -FilePath $pngPath
            }
        }
        
        if (-not $downloaded) {
            $url = Get-ImageUrlFromPageImages -Title $altTitle
            if ($url) {
                $downloaded = Download-Image -Url $url -FilePath $pngPath
            }
        }
    }
    
    # Method 5: Search Wikipedia
    if (-not $downloaded) {
        Write-Host "  -> Wikipedia search..."
        $searchQuery = [Uri]::EscapeDataString($wikiTitle)
        $searchUrl = "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=$searchQuery&format=json&srlimit=3"
        try {
            $searchResult = Invoke-RestMethod -Uri $searchUrl -Method Get -UserAgent $userAgent -ErrorAction Stop
            if ($searchResult.query.search) {
                foreach ($result in $searchResult.query.search) {
                    if (-not $downloaded) {
                        $foundTitle = $result.title
                        Write-Host "    Found: $foundTitle"
                        $url = Get-ImageUrlFromPageImages -Title $foundTitle
                        if ($url) {
                            $downloaded = Download-Image -Url $url -FilePath $pngPath
                        }
                    }
                }
            }
        } catch { }
    }
    
    if ($downloaded) {
        Write-Host "  -> SUCCESS" -ForegroundColor Green
        # Clean up any SVG placeholder
        if (Test-Path $svgPath) { Remove-Item $svgPath -Force }
        Remove-Item (Join-Path $OutputDir "$slug.svg") -ErrorAction SilentlyContinue
        $Results += @{Slug = $slug; Status = "SUCCESS"}
    } else {
        Write-Host "  -> PLACEHOLDER" -ForegroundColor Yellow
        Create-Placeholder -FilePath $svgPath -Slug $slug
        $Results += @{Slug = $slug; Status = "PLACEHOLDER"}
    }
}

Write-Host "`n================== RESULTS ==================" -ForegroundColor Cyan
$successCount = ($Results | Where-Object { $_.Status -eq "SUCCESS" }).Count
$placeholderCount = ($Results | Where-Object { $_.Status -eq "PLACEHOLDER" }).Count
Write-Host "Success: $successCount / Placeholder: $placeholderCount" -ForegroundColor Cyan
foreach ($r in $Results) {
    $color = if ($r.Status -eq "SUCCESS") { "Green" } else { "DarkYellow" }
    Write-Host "  $($r.Slug): $($r.Status)" -ForegroundColor $color
}
