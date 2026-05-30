$OutputDir = "C:\Users\USER\scholarhub-nextjs\public\images\schools"
$Results = @()

$Schools = @(
    @{Name = "King's College, Lagos"; Slug = "kings-college-lagos"},
    @{Name = "Loyola Jesuit College, Abuja"; Slug = "loyola-jesuit-college-abuja"},
    @{Name = "Queen's College, Lagos"; Slug = "queens-college-lagos"},
    @{Name = "Government Secondary School, Enugu"; Slug = "government-secondary-school-enugu"},
    @{Name = "Federal Government College, Ilorin"; Slug = "federal-government-college-ilorin"},
    @{Name = "Alliance High School, Nairobi"; Slug = "alliance-high-school-nairobi"},
    @{Name = "St. George's College, Nairobi"; Slug = "st-georges-college-nairobi"},
    @{Name = "St. Mary's School, Nairobi"; Slug = "st-marys-school-nairobi"},
    @{Name = "International School of Kenya"; Slug = "international-school-of-kenya"},
    @{Name = "Mpesa Foundation Academy"; Slug = "mpesa-foundation-academy"},
    @{Name = "Hillcrest Secondary School, Nairobi"; Slug = "hillcrest-secondary-school-nairobi"},
    @{Name = "Achimota School, Accra"; Slug = "achimota-school-accra"},
    @{Name = "Ghana National College"; Slug = "ghana-national-college"},
    @{Name = "St. Augustine's College, Cape Coast"; Slug = "st-augustines-college-cape-coast"},
    @{Name = "St. John's College, Johannesburg"; Slug = "st-johns-college-johannesburg"},
    @{Name = "Bishops Diocesan College, Cape Town"; Slug = "bishops-diocesan-college-cape-town"},
    @{Name = "St. Joseph's College, Durban"; Slug = "st-josephs-college-durban"},
    @{Name = "St. Charles Lwanga School, Kampala"; Slug = "st-charles-lwanga-school-kampala"},
    @{Name = "SOS Hermann Gmeiner School, Addis Ababa"; Slug = "sos-hermann-gmeiner-school-addis-ababa"},
    @{Name = "Lycée Sainte Famille, Abidjan"; Slug = "lycee-sainte-famille-abidjan"},
    @{Name = "University of Ibadan"; Slug = "university-of-ibadan"},
    @{Name = "Obafemi Awolowo University"; Slug = "obafemi-awolowo-university"},
    @{Name = "University of Lagos"; Slug = "university-of-lagos"},
    @{Name = "Covenant University"; Slug = "covenant-university"},
    @{Name = "University of Nigeria Nsukka"; Slug = "university-of-nigeria-nsukka"},
    @{Name = "Ahmadu Bello University"; Slug = "ahmadu-bello-university"},
    @{Name = "Federal University of Technology Owerri"; Slug = "federal-university-of-technology-owerri"},
    @{Name = "University of Benin"; Slug = "university-of-benin"},
    @{Name = "Lagos State University"; Slug = "lagos-state-university"},
    @{Name = "Nnamdi Azikiwe University"; Slug = "nnamdi-azikiwe-university"},
    @{Name = "University of Nairobi"; Slug = "university-of-nairobi"},
    @{Name = "Kenyatta University"; Slug = "kenyatta-university"},
    @{Name = "Strathmore University"; Slug = "strathmore-university"},
    @{Name = "Moi University"; Slug = "moi-university"},
    @{Name = "Egerton University"; Slug = "egerton-university"},
    @{Name = "University of Ghana"; Slug = "university-of-ghana"},
    @{Name = "Kwame Nkrumah University of Science and Technology"; Slug = "kwame-nkrumah-university-of-science-and-technology"},
    @{Name = "University of Cape Coast"; Slug = "university-of-cape-coast"},
    @{Name = "University of Cape Town"; Slug = "university-of-cape-town"},
    @{Name = "University of the Witwatersrand"; Slug = "university-of-the-witwatersrand"},
    @{Name = "Stellenbosch University"; Slug = "stellenbosch-university"},
    @{Name = "University of Pretoria"; Slug = "university-of-pretoria"},
    @{Name = "Rhodes University"; Slug = "rhodes-university"},
    @{Name = "University of Johannesburg"; Slug = "university-of-johannesburg"},
    @{Name = "Makerere University"; Slug = "makerere-university"},
    @{Name = "Addis Ababa University"; Slug = "addis-ababa-university"},
    @{Name = "University of Dar es Salaam"; Slug = "university-of-dar-es-salaam"},
    @{Name = "Cairo University"; Slug = "cairo-university"},
    @{Name = "University of Khartoum"; Slug = "university-of-khartoum"},
    @{Name = "University of Botswana"; Slug = "university-of-botswana"},
    @{Name = "Université Cheikh Anta Diop"; Slug = "universite-cheikh-anta-diop"}
)

function Get-WikipediaImage {
    param([string]$Title)
    
    $encoded = [System.Uri]::EscapeDataString($Title)
    $url = "https://en.wikipedia.org/api/rest_v1/page/summary/$encoded"
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -ContentType "application/json" -ErrorAction Stop
        if ($response.originalimage -and $response.originalimage.source) {
            return $response.originalimage.source
        }
        if ($response.thumbnail -and $response.thumbnail.source) {
            return $response.thumbnail.source
        }
        return $null
    } catch {
        return $null
    }
}

function Get-WikipediaImageViaSearch {
    param([string]$Query)
    
    $encoded = [System.Uri]::EscapeDataString($Query)
    $searchUrl = "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=$encoded&format=json&srlimit=3"
    
    try {
        $searchResult = Invoke-RestMethod -Uri $searchUrl -Method Get -ErrorAction Stop
        if ($searchResult.query.search -and $searchResult.query.search.Count -gt 0) {
            foreach ($result in $searchResult.query.search) {
                $pageTitle = $result.title
                $imgUrl = Get-WikipediaImage -Title $pageTitle
                if ($imgUrl) {
                    return $imgUrl
                }
            }
        }
    } catch {}
    return $null
}

function Get-WikipediaImageByPageId {
    param([string]$Query)
    
    $encoded = [System.Uri]::EscapeDataString($Query)
    $url = "https://en.wikipedia.org/w/api.php?action=query&titles=$encoded&prop=pageimages&format=json&pithumbsize=500"
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
        $pages = $response.query.pages
        $pageId = ($pages | Get-Member -MemberType NoteProperty | Select-Object -First 1).Name
        if ($pageId -ne "-1" -and $pages.$pageId.thumbnail -and $pages.$pageId.thumbnail.source) {
            return $pages.$pageId.thumbnail.source
        }
    } catch {}
    return $null
}

function Get-ImageViaWebSearch {
    param([string]$SchoolName)
    
    $searchQuery = [System.Uri]::EscapeDataString("$SchoolName official logo crest png")
    $searchUrl = "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=$searchQuery&format=json&srlimit=5"
    
    try {
        $searchResult = Invoke-RestMethod -Uri $searchUrl -Method Get -ErrorAction Stop
        if ($searchResult.query.search) {
            foreach ($result in $searchResult.query.search) {
                $pageTitle = $result.title
                $imgUrl = Get-WikipediaImage -Title $pageTitle
                if ($imgUrl) {
                    return $imgUrl
                }
                $imgUrl = Get-WikipediaImageByPageId -Query $pageTitle
                if ($imgUrl) {
                    return $imgUrl
                }
            }
        }
    } catch {}
    return $null
}

function Save-Image {
    param([string]$Url, [string]$FilePath)
    
    if (-not $Url) { return $false }
    
    try {
        # Ensure URL uses https
        if ($Url.StartsWith("http://")) {
            $Url = $Url.Replace("http://", "https://")
        }
        
        # Upgrade to a larger version if it's a thumbnail
        $finalUrl = $Url -replace "/\d+px-", "/500px-"
        
        Write-Host "  Downloading from: $finalUrl"
        Invoke-WebRequest -Uri $finalUrl -OutFile $FilePath -ErrorAction Stop
        return (Test-Path $FilePath)
    } catch {
        # Try original URL
        try {
            Write-Host "  Retrying with original URL: $Url"
            Invoke-WebRequest -Uri $Url -OutFile $FilePath -ErrorAction Stop
            return (Test-Path $FilePath)
        } catch {
            return $false
        }
    }
}

function Create-Placeholder {
    param([string]$FilePath, [string]$SchoolName, [int]$Width = 200, [int]$Height = 200)
    
    try {
        # Create a simple SVG placeholder
        $svg = @"
<svg xmlns="http://www.w3.org/2000/svg" width="$Width" height="$Height" viewBox="0 0 $Width $Height">
  <rect width="$Width" height="$Height" fill="#f0f0f0"/>
  <rect x="10" y="10" width="$($Width - 20)" height="$($Height - 20)" fill="none" stroke="#ccc" stroke-width="2"/>
  <text x="$($Width/2)" y="$($Height/2 - 10)" text-anchor="middle" fill="#999" font-family="sans-serif" font-size="14">No Logo</text>
  <text x="$($Width/2)" y="$($Height/2 + 15)" text-anchor="middle" fill="#999" font-family="sans-serif" font-size="10">$SchoolName</text>
</svg>
"@
        $svgPath = $FilePath -replace '\.png$', '.svg'
        Set-Content -Path $svgPath -Value $svg -Encoding UTF8
        return $true
    } catch {
        return $false
    }
}

$total = $Schools.Count
$current = 0

foreach ($school in $Schools) {
    $current++
    $name = $school.Name
    $slug = $school.Slug
    $filePath = Join-Path $OutputDir "$slug.png"
    
    Write-Host "[$current/$total] Processing: $name"
    
    # Method 1: Direct Wikipedia page summary
    Write-Host "  -> Trying Wikipedia summary..."
    $imgUrl = Get-WikipediaImage -Title $name
    
    # Method 2: Try with just the school name (no location)
    if (-not $imgUrl) {
        $shortName = ($name -split ",")[0].Trim()
        if ($shortName -ne $name) {
            Write-Host "  -> Trying shorter name: $shortName"
            $imgUrl = Get-WikipediaImage -Title $shortName
        }
    }
    
    # Method 3: Try page images API
    if (-not $imgUrl) {
        Write-Host "  -> Trying page images API..."
        $imgUrl = Get-WikipediaImageByPageId -Query $name
    }
    
    # Method 4: Search Wikipedia
    if (-not $imgUrl) {
        Write-Host "  -> Searching Wikipedia..."
        $imgUrl = Get-ImageViaWebSearch -SchoolName $name
    }
    
    # Method 5: For schools, try without location
    if (-not $imgUrl -and $name -match ",") {
        $baseName = ($name -split ",")[0].Trim()
        $searchQuery = "$baseName school"
        Write-Host "  -> Searching for: $searchQuery"
        $imgUrl = Get-ImageViaWebSearch -SchoolName $searchQuery
    }
    
    # Download or create placeholder
    if ($imgUrl) {
        $success = Save-Image -Url $imgUrl -FilePath $filePath
        if ($success) {
            Write-Host "  -> SUCCESS: Logo saved as $slug.png" -ForegroundColor Green
            $Results += @{Name = $name; Slug = $slug; Status = "SUCCESS"; Url = $imgUrl}
        } else {
            Write-Host "  -> FAILED to download from $imgUrl" -ForegroundColor Red
            Create-Placeholder -FilePath $filePath -SchoolName $name
            $Results += @{Name = $name; Slug = $slug; Status = "PLACEHOLDER (download failed)"; Url = ""}
        }
    } else {
        Write-Host "  -> NOT FOUND on Wikipedia" -ForegroundColor Yellow
        Create-Placeholder -FilePath $filePath -SchoolName $name
        $Results += @{Name = $name; Slug = $slug; Status = "PLACEHOLDER (no image found)"; Url = ""}
    }
}

Write-Host ""
Write-Host "==================== RESULTS ====================" -ForegroundColor Cyan
$successCount = ($Results | Where-Object { $_.Status -eq "SUCCESS" }).Count
$placeholderCount = ($Results | Where-Object { $_.Status -ne "SUCCESS" }).Count
Write-Host "Total: $total | Success: $successCount | Placeholder: $placeholderCount" -ForegroundColor Cyan
Write-Host ""

foreach ($r in $Results) {
    $color = if ($r.Status -eq "SUCCESS") { "Green" } else { "Yellow" }
    Write-Host "$($r.Slug): $($r.Status)" -ForegroundColor $color
}
