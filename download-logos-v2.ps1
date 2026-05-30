$OutputDir = "C:\Users\USER\scholarhub-nextjs\public\images\schools"
$Results = @()

# Short pause to avoid rate limits after previous script
Start-Sleep -Seconds 5

$Schools = @(
    @{Name = "King's College, Lagos"; Wiki = "King's College, Lagos"; Slug = "kings-college-lagos"},
    @{Name = "Loyola Jesuit College, Abuja"; Wiki = "Loyola Jesuit College"; Slug = "loyola-jesuit-college-abuja"},
    @{Name = "Queen's College, Lagos"; Wiki = "Queen's College, Lagos"; Slug = "queens-college-lagos"},
    @{Name = "Government Secondary School, Enugu"; Wiki = "Government Secondary School, Enugu"; Slug = "government-secondary-school-enugu"},
    @{Name = "Federal Government College, Ilorin"; Wiki = "Federal Government College, Ilorin"; Slug = "federal-government-college-ilorin"},
    @{Name = "Alliance High School, Nairobi"; Wiki = "Alliance High School (Kenya)"; Slug = "alliance-high-school-nairobi"},
    @{Name = "St. George's College, Nairobi"; Wiki = "St. George's College, Nairobi"; Slug = "st-georges-college-nairobi"},
    @{Name = "St. Mary's School, Nairobi"; Wiki = "St. Mary's School, Nairobi"; Slug = "st-marys-school-nairobi"},
    @{Name = "International School of Kenya"; Wiki = "International School of Kenya"; Slug = "international-school-of-kenya"},
    @{Name = "Mpesa Foundation Academy"; Wiki = "Mpesa Foundation Academy"; Slug = "mpesa-foundation-academy"},
    @{Name = "Hillcrest Secondary School, Nairobi"; Wiki = "Hillcrest Secondary School, Nairobi"; Slug = "hillcrest-secondary-school-nairobi"},
    @{Name = "Achimota School"; Wiki = "Achimota School"; Slug = "achimota-school-accra"},
    @{Name = "Ghana National College"; Wiki = "Ghana National College"; Slug = "ghana-national-college"},
    @{Name = "St. Augustine's College, Cape Coast"; Wiki = "St. Augustine's College, Cape Coast"; Slug = "st-augustines-college-cape-coast"},
    @{Name = "St. John's College, Johannesburg"; Wiki = "St. John's College, Johannesburg"; Slug = "st-johns-college-johannesburg"},
    @{Name = "Bishops Diocesan College, Cape Town"; Wiki = "Diocesan College"; Slug = "bishops-diocesan-college-cape-town"},
    @{Name = "St. Joseph's College, Durban"; Wiki = "St. Joseph's College, Durban"; Slug = "st-josephs-college-durban"},
    @{Name = "St. Charles Lwanga School, Kampala"; Wiki = "St. Charles Lwanga School, Kampala"; Slug = "st-charles-lwanga-school-kampala"},
    @{Name = "SOS Hermann Gmeiner School, Addis Ababa"; Wiki = "SOS Hermann Gmeiner School, Addis Ababa"; Slug = "sos-hermann-gmeiner-school-addis-ababa"},
    @{Name = "Lycée Sainte Famille, Abidjan"; Wiki = "Lycée Sainte Famille, Abidjan"; Slug = "lycee-sainte-famille-abidjan"},
    @{Name = "University of Ibadan"; Wiki = "University of Ibadan"; Slug = "university-of-ibadan"},
    @{Name = "Obafemi Awolowo University"; Wiki = "Obafemi Awolowo University"; Slug = "obafemi-awolowo-university"},
    @{Name = "University of Lagos"; Wiki = "University of Lagos"; Slug = "university-of-lagos"},
    @{Name = "Covenant University"; Wiki = "Covenant University"; Slug = "covenant-university"},
    @{Name = "University of Nigeria, Nsukka"; Wiki = "University of Nigeria, Nsukka"; Slug = "university-of-nigeria-nsukka"},
    @{Name = "Ahmadu Bello University"; Wiki = "Ahmadu Bello University"; Slug = "ahmadu-bello-university"},
    @{Name = "Federal University of Technology Owerri"; Wiki = "Federal University of Technology Owerri"; Slug = "federal-university-of-technology-owerri"},
    @{Name = "University of Benin"; Wiki = "University of Benin"; Slug = "university-of-benin"},
    @{Name = "Lagos State University"; Wiki = "Lagos State University"; Slug = "lagos-state-university"},
    @{Name = "Nnamdi Azikiwe University"; Wiki = "Nnamdi Azikiwe University"; Slug = "nnamdi-azikiwe-university"},
    @{Name = "University of Nairobi"; Wiki = "University of Nairobi"; Slug = "university-of-nairobi"},
    @{Name = "Kenyatta University"; Wiki = "Kenyatta University"; Slug = "kenyatta-university"},
    @{Name = "Strathmore University"; Wiki = "Strathmore University"; Slug = "strathmore-university"},
    @{Name = "Moi University"; Wiki = "Moi University"; Slug = "moi-university"},
    @{Name = "Egerton University"; Wiki = "Egerton University"; Slug = "egerton-university"},
    @{Name = "University of Ghana"; Wiki = "University of Ghana"; Slug = "university-of-ghana"},
    @{Name = "Kwame Nkrumah University of Science and Technology"; Wiki = "Kwame Nkrumah University of Science and Technology"; Slug = "kwame-nkrumah-university-of-science-and-technology"},
    @{Name = "University of Cape Coast"; Wiki = "University of Cape Coast"; Slug = "university-of-cape-coast"},
    @{Name = "University of Cape Town"; Wiki = "University of Cape Town"; Slug = "university-of-cape-town"},
    @{Name = "University of the Witwatersrand"; Wiki = "University of the Witwatersrand"; Slug = "university-of-the-witwatersrand"},
    @{Name = "Stellenbosch University"; Wiki = "Stellenbosch University"; Slug = "stellenbosch-university"},
    @{Name = "University of Pretoria"; Wiki = "University of Pretoria"; Slug = "university-of-pretoria"},
    @{Name = "Rhodes University"; Wiki = "Rhodes University"; Slug = "rhodes-university"},
    @{Name = "University of Johannesburg"; Wiki = "University of Johannesburg"; Slug = "university-of-johannesburg"},
    @{Name = "Makerere University"; Wiki = "Makerere University"; Slug = "makerere-university"},
    @{Name = "Addis Ababa University"; Wiki = "Addis Ababa University"; Slug = "addis-ababa-university"},
    @{Name = "University of Dar es Salaam"; Wiki = "University of Dar es Salaam"; Slug = "university-of-dar-es-salaam"},
    @{Name = "Cairo University"; Wiki = "Cairo University"; Slug = "cairo-university"},
    @{Name = "University of Khartoum"; Wiki = "University of Khartoum"; Slug = "university-of-khartoum"},
    @{Name = "University of Botswana"; Wiki = "University of Botswana"; Slug = "university-of-botswana"},
    @{Name = "Université Cheikh Anta Diop"; Wiki = "Universit\u00e9 Cheikh Anta Diop"; Slug = "universite-cheikh-anta-diop"}
)

function Download-ImageFile {
    param([string]$Url, [string]$FilePath)
    
    try {
        Add-Type -AssemblyName System.Net.Http
        $client = New-Object System.Net.Http.HttpClient
        $client.Timeout = [TimeSpan]::FromSeconds(30)
        
        # Some Wikimedia URLs redirect; follow them
        $response = $client.GetAsync($Url).Result
        if ($response.IsSuccessStatusCode) {
            $stream = $response.Content.ReadAsStreamAsync().Result
            $fileStream = [System.IO.File]::Create($FilePath)
            $stream.CopyTo($fileStream)
            $fileStream.Close()
            $client.Dispose()
            return $true
        }
        $client.Dispose()
        return $false
    } catch {
        try {
            Invoke-WebRequest -Uri $Url -OutFile $FilePath -ErrorAction Stop -UseBasicParsing
            return (Test-Path $FilePath)
        } catch {
            return $false
        }
    }
}

function Get-WikiPageImages {
    param([string]$Title)
    
    $encoded = [System.Uri]::EscapeDataString($Title)
    
    # Step 1: Get all images on the page
    $imgUrl = "https://en.wikipedia.org/w/api.php?action=query&titles=$encoded&prop=images&format=json&imlimit=50"
    
    try {
        $result = Invoke-RestMethod -Uri $imgUrl -Method Get -ErrorAction Stop
        $pages = $result.query.pages
        $pageId = ($pages | Get-Member -MemberType NoteProperty | Select-Object -First 1).Name
        if ($pageId -eq "-1") { return $null }
        
        $images = $pages.$pageId.images
        if (-not $images -or $images.Count -eq 0) { return $null }
        
        # Look for logo/crest/seal/coat/emblem images
        $logoKeywords = @("logo", "crest", "seal", "coat", "emblem", "badge", "shield", "arms", "insignia")
        $logoImage = $null
        
        foreach ($img in $images) {
            $imgTitle = $img.title.ToLower()
            foreach ($kw in $logoKeywords) {
                if ($imgTitle.Contains($kw)) {
                    $logoImage = $img.title
                    break
                }
            }
            if ($logoImage) { break }
        }
        
        if (-not $logoImage) {
            # Also try the pageimage (from pageimages prop)
            $piUrl = "https://en.wikipedia.org/w/api.php?action=query&titles=$encoded&prop=pageimages&format=json&pithumbsize=500"
            $piResult = Invoke-RestMethod -Uri $piUrl -Method Get -ErrorAction Stop
            $piPages = $piResult.query.pages
            $piPageId = ($piPages | Get-Member -MemberType NoteProperty | Select-Object -First 1).Name
            if ($piPageId -ne "-1" -and $piPages.$piPageId.thumbnail) {
                return $piPages.$piPageId.thumbnail.source
            }
            return $null
        }
        
        # Get the URL for the image
        $imgEncoded = [System.Uri]::EscapeDataString($logoImage)
        $iiUrl = "https://en.wikipedia.org/w/api.php?action=query&titles=$imgEncoded&prop=imageinfo&format=json&iiprop=url"
        $iiResult = Invoke-RestMethod -Uri $iiUrl -Method Get -ErrorAction Stop
        $iiPages = $iiResult.query.pages
        $iiPageId = ($iiPages | Get-Member -MemberType NoteProperty | Select-Object -First 1).Name
        if ($iiPageId -ne "-1" -and $iiPages.$iiPageId.imageinfo) {
            return $iiPages.$iiPageId.imageinfo[0].url
        }
    } catch {}
    return $null
}

function Get-WikiInfoboxImage {
    param([string]$Title)
    
    $encoded = [System.Uri]::EscapeDataString($Title)
    
    # Method: Use parse action to get the HTML, extract infobox image
    # But simpler: check if the page has a Wikidata item with P154 (logo)
    
    # Get Wikidata ID
    $ppUrl = "https://en.wikipedia.org/w/api.php?action=query&titles=$encoded&prop=pageprops&format=json&ppprop=wikibase_item"
    
    try {
        $ppResult = Invoke-RestMethod -Uri $ppUrl -Method Get -ErrorAction Stop
        $ppPages = $ppResult.query.pages
        $ppPageId = ($ppPages | Get-Member -MemberType NoteProperty | Select-Object -First 1).Name
        if ($ppPageId -eq "-1") { return $null }
        
        $wikidataId = $ppPages.$ppPageId.pageprops.wikibase_item
        if (-not $wikidataId) { return $null }
        
        # Get P154 (logo) from Wikidata
        $wdUrl = "https://www.wikidata.org/w/api.php?action=wbgetentities&ids=$wikidataId&props=claims&format=json"
        $wdResult = Invoke-RestMethod -Uri $wdUrl -Method Get -ErrorAction Stop
        
        # Try P154 (logo) first
        if ($wdResult.entities.$wikidataId.claims.P154) {
            $logoClaim = $wdResult.entities.$wikidataId.claims.P154[0]
            if ($logoClaim.mainsnak.datavalue.value) {
                $filename = $logoClaim.mainsnak.datavalue.value
                # Get URL for this Commons file
                $fileEncoded = [System.Uri]::EscapeDataString($filename)
                $fileUrl = "https://commons.wikimedia.org/w/api.php?action=query&titles=File:$fileEncoded&prop=imageinfo&format=json&iiprop=url&iiurlwidth=500"
                $fileResult = Invoke-RestMethod -Uri $fileUrl -Method Get -ErrorAction Stop
                $filePages = $fileResult.query.pages
                $filePageId = ($filePages | Get-Member -MemberType NoteProperty | Select-Object -First 1).Name
                if ($filePageId -ne "-1" -and $filePages.$filePageId.imageinfo) {
                    $thumbUrl = $filePages.$filePageId.imageinfo[0].thumburl
                    $origUrl = $filePages.$filePageId.imageinfo[0].url
                    return @($thumbUrl, $origUrl)
                }
            }
        }
        
        # Try P18 (image) as fallback
        if ($wdResult.entities.$wikidataId.claims.P18) {
            $imgClaim = $wdResult.entities.$wikidataId.claims.P18[0]
            if ($imgClaim.mainsnak.datavalue.value) {
                $filename = $imgClaim.mainsnak.datavalue.value
                $fileEncoded = [System.Uri]::EscapeDataString($filename)
                $fileUrl = "https://commons.wikimedia.org/w/api.php?action=query&titles=File:$fileEncoded&prop=imageinfo&format=json&iiprop=url&iiurlwidth=500"
                $fileResult = Invoke-RestMethod -Uri $fileUrl -Method Get -ErrorAction Stop
                $filePages = $fileResult.query.pages
                $filePageId = ($filePages | Get-Member -MemberType NoteProperty | Select-Object -First 1).Name
                if ($filePageId -ne "-1" -and $filePages.$filePageId.imageinfo) {
                    $thumbUrl = $filePages.$filePageId.imageinfo[0].thumburl
                    $origUrl = $filePages.$filePageId.imageinfo[0].url
                    return @($thumbUrl, $origUrl)
                }
            }
        }
    } catch {}
    return $null
}

function Search-WikiTitle {
    param([string]$Query)
    
    $encoded = [System.Uri]::EscapeDataString($Query)
    $url = "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=$encoded&format=json&srlimit=3"
    
    try {
        $result = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
        if ($result.query.search -and $result.query.search.Count -gt 0) {
            return $result.query.search[0].title
        }
    } catch {}
    return $null
}

# First pass: try getting Wikidata logos via batch (most reliable)
Write-Host "Phase 1: Trying Wikidata logos for all schools..." -ForegroundColor Cyan

# Batch Wikipedia titles to get page info (50 per batch)
$batchSize = 25
for ($i = 0; $i -lt $Schools.Count; $i += $batchSize) {
    $batch = $Schools[$i..([Math]::Min($i + $batchSize - 1, $Schools.Count - 1))]
    $titles = ($batch | ForEach-Object { $_.Wiki }) -join "|"
    $encodedTitles = [System.Uri]::EscapeDataString($titles)
    
    $url = "https://en.wikipedia.org/w/api.php?action=query&titles=$encodedTitles&prop=pageprops&format=json&ppprop=wikibase_item"
    
    try {
        $result = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
        $pages = $result.query.pages
        
        $wikidataIds = @()
        foreach ($pageId in $pages.PSObject.Properties.Name) {
            $page = $pages.$pageId
            if ($page.pageprops -and $page.pageprops.wikibase_item) {
                $wikidataIds += $page.pageprops.wikibase_item
            }
        }
        
        if ($wikidataIds.Count -gt 0) {
            # Get P154 (logo) from Wikidata in batch
            $wdIds = $wikidataIds -join "|"
            $wdUrl = "https://www.wikidata.org/w/api.php?action=wbgetentities&ids=$wdIds&props=claims&format=json"
            
            try {
                $wdResult = Invoke-RestMethod -Uri $wdUrl -Method Get -ErrorAction Stop
                
                foreach ($pageId in $pages.PSObject.Properties.Name) {
                    $page = $pages.$pageId
                    $title = $page.title
                    $wdId = $page.pageprops.wikibase_item
                    
                    $school = $Schools | Where-Object { $_.Wiki -eq $title } | Select-Object -First 1
                    if (-not $school) { continue }
                    
                    if ($wdResult.entities.$wdId.claims.P154) {
                        $filename = $wdResult.entities.$wdId.claims.P154[0].mainsnak.datavalue.value
                        Write-Host "  Found logo (P154) for $title : $filename" -ForegroundColor Green
                        $school | Add-Member -NotePropertyName "WikidataLogo" -NotePropertyValue $filename -Force
                    } elseif ($wdResult.entities.$wdId.claims.P18) {
                        $filename = $wdResult.entities.$wdId.claims.P18[0].mainsnak.datavalue.value
                        Write-Host "  Found image (P18) for $title : $filename" -ForegroundColor Yellow
                        $school | Add-Member -NotePropertyName "WikidataLogo" -NotePropertyValue $filename -Force
                    }
                }
            } catch {
                Write-Host "  Wikidata batch query failed: $_" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "  Wikipedia batch query failed: $_" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 2
}

# Phase 2: Download from Wikidata
Write-Host "`nPhase 2: Downloading images..." -ForegroundColor Cyan

foreach ($school in $Schools) {
    $slug = $school.Slug
    $filePath = Join-Path $OutputDir "$slug.png"
    $svgPath = Join-Path $OutputDir "$slug.svg"
    $name = $school.Name
    $wikiTitle = $school.Wiki
    
    # Remove placeholder SVG if it exists
    if (Test-Path $svgPath) { Remove-Item $svgPath -Force }
    
    $downloaded = $false
    
    # Method 1: Download from Wikidata if we have a filename
    if ($school.WikidataLogo) {
        $filename = $school.WikidataLogo
        $fileEncoded = [System.Uri]::EscapeDataString($filename)
        
        # Direct Commons URL
        $commonsUrl = "https://commons.wikimedia.org/wiki/Special:FilePath/$fileEncoded?width=500"
        
        Write-Host "  [$slug] Downloading from Commons: $commonsUrl"
        $downloaded = Download-ImageFile -Url $commonsUrl -FilePath $filePath
        
        if (-not $downloaded) {
            # Try via API
            try {
                $fileApiUrl = "https://commons.wikimedia.org/w/api.php?action=query&titles=File:$fileEncoded&prop=imageinfo&format=json&iiprop=url&iiurlwidth=500"
                $fileResult = Invoke-RestMethod -Uri $fileApiUrl -Method Get -ErrorAction Stop
                $filePages = $fileResult.query.pages
                $filePageId = ($filePages | Get-Member -MemberType NoteProperty | Select-Object -First 1).Name
                if ($filePageId -ne "-1" -and $filePages.$filePageId.imageinfo) {
                    $imgUrl = $filePages.$filePageId.imageinfo[0].thumburl
                    Write-Host "  [$slug] Trying thumb URL: $imgUrl"
                    $downloaded = Download-ImageFile -Url $imgUrl -FilePath $filePath
                }
            } catch {}
        }
    }
    
    # Method 2: Try Wikipedia pageimages (for the main article image)
    if (-not $downloaded) {
        Write-Host "  [$slug] Trying Wikipedia page images..."
        try {
            $encoded = [System.Uri]::EscapeDataString($wikiTitle)
            $piUrl = "https://en.wikipedia.org/w/api.php?action=query&titles=$encoded&prop=pageimages&format=json&pithumbsize=500"
            $piResult = Invoke-RestMethod -Uri $piUrl -Method Get -ErrorAction Stop
            $piPages = $piResult.query.pages
            $piPageId = ($piPages | Get-Member -MemberType NoteProperty | Select-Object -First 1).Name
            if ($piPageId -ne "-1" -and $piPages.$piPageId.thumbnail) {
                $imgUrl = $piPages.$piPageId.thumbnail.source
                Write-Host "  [$slug] Downloading from pageimage: $imgUrl"
                $downloaded = Download-ImageFile -Url $imgUrl -FilePath $filePath
            }
        } catch {}
    }
    
    # Method 3: Try searching for a different page title
    if (-not $downloaded) {
        Write-Host "  [$slug] Searching for correct Wikipedia page..."
        try {
            $searchTitle = Search-WikiTitle -Query $name
            if ($searchTitle -and $searchTitle -ne $wikiTitle) {
                Write-Host "  [$slug] Found title: $searchTitle"
                $encoded = [System.Uri]::EscapeDataString($searchTitle)
                $piUrl = "https://en.wikipedia.org/w/api.php?action=query&titles=$encoded&prop=pageimages&format=json&pithumbsize=500"
                $piResult = Invoke-RestMethod -Uri $piUrl -Method Get -ErrorAction Stop
                $piPages = $piResult.query.pages
                $piPageId = ($piPages | Get-Member -MemberType NoteProperty | Select-Object -First 1).Name
                if ($piPageId -ne "-1" -and $piPages.$piPageId.thumbnail) {
                    $imgUrl = $piPages.$piPageId.thumbnail.source
                    Write-Host "  [$slug] Downloading from search result: $imgUrl"
                    $downloaded = Download-ImageFile -Url $imgUrl -FilePath $filePath
                }
            }
        } catch {}
    }
    
    if ($downloaded) {
        Write-Host "  [$slug] SUCCESS!" -ForegroundColor Green
        $Results += @{Name = $name; Slug = $slug; Status = "SUCCESS"}
    } else {
        Write-Host "  [$slug] FAILED - creating placeholder" -ForegroundColor Red
        # Create placeholder as SVG
        $svgContent = @"
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#f5f5f5"/>
  <rect x="5" y="5" width="190" height="190" fill="none" stroke="#ddd" stroke-width="2" rx="8"/>
  <text x="100" y="90" text-anchor="middle" fill="#bbb" font-family="Arial,sans-serif" font-size="14">No Logo</text>
  <text x="100" y="115" text-anchor="middle" fill="#bbb" font-family="Arial,sans-serif" font-size="9">$name</text>
  <text x="100" y="180" text-anchor="middle" fill="#ddd" font-family="Arial,sans-serif" font-size="8">placeholder</text>
</svg>
"@
        Set-Content -Path (Join-Path $OutputDir "$slug.svg") -Value $svgContent -Encoding UTF8
        $Results += @{Name = $name; Slug = $slug; Status = "PLACEHOLDER"}
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host "`n==================== FINAL RESULTS ====================" -ForegroundColor Cyan
$successCount = ($Results | Where-Object { $_.Status -eq "SUCCESS" }).Count
$placeholderCount = ($Results | Where-Object { $_.Status -eq "PLACEHOLDER" }).Count
Write-Host "Total: $($Results.Count) | Success: $successCount | Placeholder: $placeholderCount" -ForegroundColor Cyan
Write-Host ""

foreach ($r in $Results) {
    $color = if ($r.Status -eq "SUCCESS") { "Green" } else { "Yellow" }
    Write-Host "$($r.Slug): $($r.Status)" -ForegroundColor $color
}
